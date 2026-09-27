// server.ts (custom Node সার্ভার) আর Next.js API রুট আলাদা মডিউল-সিস্টেমে চলে,
// তাই সাধারণ module-level ভ্যারিয়েবল শেয়ার হয় না। globalThis ব্যবহার করে
// পুরো প্রসেস জুড়ে একই মান শেয়ার করা হচ্ছে (lib/chatEvents.ts-এও একই কৌশল)।
const globalForVisitors = globalThis as unknown as {
    __liveVisitorCount?: number;
  };
  
  export function setLiveVisitorCount(n: number) {
    globalForVisitors.__liveVisitorCount = n;
  }
  
  export function liveVisitorCount(): number {
    return globalForVisitors.__liveVisitorCount ?? 0;
  }