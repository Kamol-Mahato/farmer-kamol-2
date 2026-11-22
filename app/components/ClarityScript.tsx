"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const BLOCKED_PREFIXES = ["/admin", "/agent"];

export default function ClarityScript() {
  const pathname = usePathname() || "";
  const blocked = BLOCKED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  useEffect(() => {
    const w = window as any;
    if (typeof w.clarity !== "function") return;
    if (blocked) {
      // পাবলিক পেজ থেকে ক্লায়েন্ট-সাইডে admin এ গেলে রেকর্ডিং থামাও
      w.clarity("stop");
      w.__clarityStopped = true;
    } else if (w.__clarityStopped) {
      w.clarity("start");
      w.__clarityStopped = false;
    }
  }, [blocked]);

  if (blocked) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "zgo65o5zfw");
      `}
    </Script>
  );
}