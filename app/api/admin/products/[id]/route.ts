import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeHtml } from "@/lib/sanitize";
import { verifyAdminOrAgent } from "@/lib/adminAuth";
import { submitUrls } from "@/lib/indexnow";
import { siteConfig } from "@/lib/siteConfig";
import { normalizeSizes } from "@/lib/productSizes";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAuthorized = await verifyAdminOrAgent();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
        category: true,
        sizes: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!product)
      return NextResponse.json({ error: "পণ্য পাওয়া যায়নি" }, { status: 404 });
    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/shop");
    revalidatePath("/en/shop");
    if (product.slug) revalidatePath(`/shop/${product.slug}`);
    if (product.slugEn) revalidatePath(`/en/shop/${product.slugEn}`);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAuthorized = await verifyAdminOrAgent();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const sizeResult = normalizeSizes(body.sizes);
    if (sizeResult.ok === false) {
      return NextResponse.json({ error: sizeResult.error }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        slug: body.slug,
        nameEn: body.nameEn || null,
        slugEn: body.slugEn || null,
        nameBanglish: body.nameBanglish || null,
        description: body.description
          ? sanitizeHtml(body.description)
          : body.description,
        descriptionEn: body.descriptionEn
          ? sanitizeHtml(body.descriptionEn)
          : null,
        categoryId: body.categoryId || null,
        pricePerUnit: body.pricePerUnit,
        discountPrice: body.discountPrice,
        unit: body.unit,
        stockQty: body.stockQty,
        isFeatured: body.isFeatured,
        isTopSeller: body.isTopSeller,
        isActive: body.isActive,
        isOutOfStockVisible: body.isOutOfStockVisible,
        priceType: body.priceType || "FIXED",
        // ✅ sizes পাঠানো হলে পুরনো সব মুছে নতুন তালিকা সেভ (না পাঠালে অপরিবর্তিত)
        ...(Array.isArray(body.sizes)
          ? { sizes: { deleteMany: {}, create: sizeResult.sizes } }
          : {}),
        homeOrder:
          body.homeOrder === "" ||
          body.homeOrder === null ||
          body.homeOrder === undefined
            ? null
            : Number(body.homeOrder),
        // ✅ একাধিক ছবি থাকলে পুরনো সব ছবি মুছে নতুন সবগুলো সেভ হবে, প্রথমটা isPrimary
        images:
          body.imageUrls && body.imageUrls.length > 0
            ? {
                deleteMany: {},
                create: body.imageUrls.map((url: string, idx: number) => ({
                  imageUrl: url,
                  isPrimary: idx === 0,
                })),
              }
            : body.imageUrl
              ? {
                  deleteMany: {},
                  create: [{ imageUrl: body.imageUrl, isPrimary: true }],
                }
              : undefined,
      },
    });
    // দাম/তথ্য বদলালে user পেজ সাথে সাথে আপডেট
    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/shop");
    revalidatePath("/en/shop");
    if (product.slug) revalidatePath(`/shop/${product.slug}`);
    revalidatePath(`/en/shop/${product.slugEn || product.slug}`);
    revalidatePath("/[landing]", "page");
    revalidatePath("/en/[landing]", "page");

    // IndexNow — Active থাকলে সাবমিট
    if (product.isActive && product.slug) {
      const urls = [`${siteConfig.domain.url}/shop/${product.slug}`];
      if (product.slugEn) {
        urls.push(`${siteConfig.domain.url}/en/shop/${product.slugEn}`);
      } else {
        urls.push(`${siteConfig.domain.url}/en/shop/${product.slug}`);
      }
      submitUrls(...urls).catch((err) =>
        console.error("IndexNow product update error:", err),
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}
