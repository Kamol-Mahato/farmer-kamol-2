import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyVisitorSession } from "@/lib/visitorSession";
import { ChatSenderType } from "@prisma/client";
import { sendTelegramAlert, escapeHtml } from "@/lib/telegram";
import { chatEvents } from "@/lib/chatEvents";
import { checkAndIncrementRate } from "@/lib/rateLimiter";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  CHAT_WELCOME_TEXT,
  CHAT_WELCOME_TEXT_EN,
} from "@/lib/chatWelcomeMessage";
import { getApiLocale } from "@/lib/apiLocale";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE_HEADERS: HeadersInit = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Cloudflare-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE_HEADERS });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const existingToken = cookieStore.get("visitor_session")?.value;

    if (!existingToken) {
      return json({ error: "অননুমোদিত সেশন" }, 401);
    }

    const visitorId = await verifyVisitorSession(existingToken);
    if (!visitorId) {
      return json({ error: "অবৈধ সেশন" }, 401);
    }
    const { allowed } = await checkAndIncrementRate(
      `chat-send:${visitorId}`,
      15,
      60,
    );
    if (!allowed) {
      return json({ error: "একটু ধীরে... কিছুক্ষণ পর আবার চেষ্টা করুন" }, 429);
    }

    const body = await req.json();
    const { text } = body;

    if (!text || text.trim() === "") {
      return json({ error: "মেসেজ খালি হতে পারে না" }, 400);
    }

    const trimmed = sanitizeHtml(String(text).trim());
    if (!trimmed || trimmed.length === 0) {
      return json({ error: "মেসেজ খালি হতে পারে না" }, 400);
    }
    if (trimmed.length > 2000) {
      return json({ error: "মেসেজ খুব বড়" }, 400);
    }

    let conversation = await prisma.chatConversation.findUnique({
      where: { visitorId },
    });
    let isNewConversation = false;

    if (!conversation) {
      isNewConversation = true;
      try {
        conversation = await prisma.chatConversation.create({
          data: {
            visitorId,
            status: "OPEN",
            messages: {
              create: {
                senderType: "SYSTEM",
                text:
                  getApiLocale(req) === "en"
                    ? CHAT_WELCOME_TEXT_EN
                    : CHAT_WELCOME_TEXT,
              },
            },
          },
        });
      } catch (err: unknown) {
        // রেস: একই visitorId থেকে দুইটা রিকোয়েস্ট একসাথে এলে unique conflict
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code?: string }).code)
            : "";
        if (code === "P2002") {
          isNewConversation = false;
          conversation = await prisma.chatConversation.findUnique({
            where: { visitorId },
          });
        } else {
          throw err;
        }
      }
    }

    if (!conversation) {
      return json({ error: "কনভারসেশন শুরু করতে সমস্যা হয়েছে" }, 500);
    }

    if (isNewConversation) {
      chatEvents.emitVisitorBound({
        visitorId,
        conversationId: conversation.id,
      });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: ChatSenderType.CUSTOMER,
        text: trimmed,
        isRead: false,
      },
    });

    const updated = await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        status: "OPEN",
      },
    });

    const messagePayload = {
      id: newMessage.id,
      conversationId: conversation.id,
      senderType: "CUSTOMER" as const,
      senderId: null,
      text: newMessage.text,
      isRead: false,
      createdAt: newMessage.createdAt.toISOString(),
    };

    chatEvents.emitMessage(messagePayload);
    chatEvents.emitConversation({
      id: conversation.id,
      visitorId: conversation.visitorId,
      visitorName: conversation.visitorName,
      visitorPhone: conversation.visitorPhone,
      status: "OPEN",
      lastMessageAt: updated.lastMessageAt.toISOString(),
      lastMessage: {
        id: newMessage.id,
        text: newMessage.text,
        senderType: "CUSTOMER",
        createdAt: messagePayload.createdAt,
      },
    });

    void sendTelegramAlert(
      `💬 <b>নতুন চ্যাট মেসেজ</b>\n` +
        `কনভারসেশন #${conversation.id}\n` +
        `${escapeHtml(trimmed.slice(0, 300))}${trimmed.length > 300 ? "…" : ""}\n\n` +
        `Admin: /admin/chat`,
    );

    return json({ message: newMessage, conversationId: conversation.id });
  } catch (error) {
    console.error("CHAT SEND ERROR:", error);
    return json({ error: "মেসেজ পাঠাতে সমস্যা হয়েছে" }, 500);
  }
}
