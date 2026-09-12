import { Resend } from "resend";

let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return resend;
}

export async function sendOtpEmail(to: string, otp: string) {
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  await getResend().emails.send({
    from: `Farmer Kamol <${from}>`,
    to,
    subject: "আপনার ভেরিফিকেশন কোড — Farmer Kamol",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color:#1B4332;">Farmer Kamol বিনিয়োগ ভেরিফিকেশন</h2>
        <p>আপনার ভেরিফিকেশন কোড:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p style="color:#888; font-size: 13px;">এই কোডটি ৫ মিনিটের জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন।</p>
      </div>
    `,
  });
}