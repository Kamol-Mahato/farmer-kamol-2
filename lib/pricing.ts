// ✅ discountPrice থেকে save % হিসাব করার কমন ফাংশন — সব প্রোডাক্ট কার্ড/পেজে ব্যবহার হবে
export function getSavePercent(pricePerUnit: number, discountPrice: number | null): number | null {
  if (!discountPrice || discountPrice >= pricePerUnit) return null
  return Math.round(((pricePerUnit - discountPrice) / pricePerUnit) * 100)
}