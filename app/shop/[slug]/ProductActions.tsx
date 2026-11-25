"use client";
import Link from "next/link";
import { useState } from "react";
import { getSavePercent } from "@/lib/pricing";
import { buildSizeChoices, type PublicSize } from "@/lib/sizeChoices";
import SizeChips from "@/app/components/SizeChips";

type Product = {
  id: number;
  name: string;
  pricePerUnit: number;
  unit: string;
  stockQty: number;
  priceType: "FIXED" | "NEGOTIABLE";
  basePrice?: number;
  baseDiscountPrice?: number | null;
  sizes?: PublicSize[];
};

// ✅ একই toast logic যা ProductCard এ আছে
function showCartToast(name: string) {
  const existing = document.getElementById("cart-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "cart-toast";
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:22px;">🛒</span>
      <div>
        <div style="font-weight:700;font-size:14px;">${name}</div>
        <div style="font-size:12px;opacity:0.85;">কার্টে যোগ হয়েছে!</div>
      </div>
      <span style="font-size:20px;margin-left:4px;">✅</span>
    </div>
  `;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 16px;
    z-index: 9999;
    background:rgb(21, 23, 2);
    color: white;
    padding: 14px 18px;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    font-family: inherit;
    min-width: 220px;
    max-width: 300px;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(.22,1,.36,1);
    border: 2px solid #22c55e;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0)";
    });
  });
  setTimeout(() => {
    toast.style.transform = "translateX(120%)";
    setTimeout(() => toast.remove(), 350);
  }, 2500);
}

function buildWhatsAppLink(productName: string) {
  const phone = "8801737939688";
  const message = `আমি "${productName}" সম্পর্কে জানতে চাই`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function ProductActions({
  product,
  mainImage,
  children,
}: {
  product: Product;
  mainImage: string;
  children?: React.ReactNode;
}) {
  const [added, setAdded] = useState(false);
  const choices = buildSizeChoices(
    {
      unit: product.unit,
      pricePerUnit: product.basePrice ?? product.pricePerUnit,
      discountPrice: product.baseDiscountPrice ?? null,
      stockQty: product.stockQty,
      sizes: product.sizes,
    },
    "bn",
  );
  const hasSizes = choices.length > 1;
  const [selIdx, setSelIdx] = useState(() => {
    const i = choices.findIndex((c) => !c.outOfStock);
    return i < 0 ? 0 : i;
  });
  const choice = choices[Math.min(selIdx, choices.length - 1)];
  const isOutOfStock = choice.outOfStock;
  const savePercent = getSavePercent(choice.price, choice.discountPrice);
  const shownPrice =
    savePercent !== null ? (choice.discountPrice as number) : choice.price;

  function handleAddToCart() {
    const cart = JSON.parse(localStorage.getItem("farmer_kamol_cart") || "[]");
    const existing = cart.find(
      (i: { id: number; sizeId?: number | null }) =>
        i.id === product.id && (i.sizeId ?? null) === choice.sizeId,
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: shownPrice,
        unit: choice.sizeId ? choice.label : product.unit,
        sizeId: choice.sizeId,
        sizeLabel: choice.sizeId ? choice.label : null,
        image: mainImage,
        quantity: 1,
      });
    }
    localStorage.setItem("farmer_kamol_cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    showCartToast(product.name);
  }

  if (product.priceType === "NEGOTIABLE") {
    return (
      <a
        href={buildWhatsAppLink(product.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-700 text-white hover:bg-green-600 active:scale-95 transition"
      >
        💬 WhatsApp এ যোগাযোগ করুন
      </a>
    );
  }

  return (
    <div>
      {hasSizes && (
        <>
          <div className="mb-4 flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-extrabold text-black">
              ৳ {shownPrice}
            </span>
            <span className="text-sm text-gray-500">/ {choice.label}</span>
            {savePercent !== null && (
              <>
                <span className="text-lg text-gray-500 line-through">
                  ৳ {choice.price}
                </span>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {savePercent}% সেভ
                </span>
              </>
            )}
          </div>
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              প্যাক বেছে নিন:
            </p>
            <SizeChips
              choices={choices}
              selected={selIdx}
              onSelect={setSelIdx}
              ariaLabel="প্যাক সাইজ"
            />
          </div>
          {children}
        </>
      )}
    <div className="flex gap-3">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`flex-1 py-3 rounded-xl font-bold text-base transition border-2 ${
          isOutOfStock
            ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
            : added
              ? "border-green-500 bg-green-500 text-white scale-95"
              : "border-green-600 bg-white text-green-700 hover:bg-green-50"
        }`}
      >
        {added ? "✓ যোগ হয়েছে" : "🛒 Add to Cart"}
      </button>
      <Link
        href={
          isOutOfStock
            ? "#"
            : `/order?productId=${product.id}${choice.sizeId ? `&sizeId=${choice.sizeId}` : ""}`
        }
        className={`flex-1 py-3 rounded-xl font-bold text-base flex items-center justify-center text-center transition ${
          isOutOfStock
            ? "bg-gray-100 text-gray-500 cursor-not-allowed pointer-events-none"
            : "bg-green-700 text-white hover:bg-green-600 active:scale-95"
        }`}
      >
        অর্ডার করুন
        </Link>
    </div>
    </div>
  );
}
