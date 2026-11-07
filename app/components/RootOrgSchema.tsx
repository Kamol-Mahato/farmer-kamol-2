"use client";
import { usePathname } from "next/navigation";
import OrganizationSchema from "./OrganizationSchema";

// layout-এ headers() ছাড়াই BN/EN অনুযায়ী Organization schema বসানোর জন্য
export default function RootOrgSchema() {
  const pathname = usePathname() || "";
  return <OrganizationSchema lang={pathname.startsWith("/en") ? "en" : "bn"} />;
}