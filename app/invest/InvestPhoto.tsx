import type { ReactNode } from "react";
import { investImage } from "@/lib/investImages";

export default function InvestPhoto({
  name,
  alt,
  children,
}: {
  name: string | string[];
  alt: string;
  children?: ReactNode;
}) {
  const src = investImage(name);
  if (!src) return <>{children}</>;
  return <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />;
}