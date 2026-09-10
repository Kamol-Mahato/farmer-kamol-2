import type { Metadata } from "next";
import MeContent from "./MeContent";

export const metadata: Metadata = {
  title: { absolute: "Kamol Kumar Mahato — CV" },
  description:
    "Kamol Kumar Mahato — Fulfillment & Logistics Specialist. Professional CV and portfolio.",
  robots: { index: true, follow: true },
};

export default function MePage() {
  return <MeContent />;
}