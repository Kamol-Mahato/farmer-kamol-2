// server.ts ভিজিটর WebSocket কানেকশনের সংখ্যা এখানে সেট করে, /api/admin/live-visitors
// রুট এখান থেকে পড়ে অ্যাডমিন প্যানেলে "এই মুহূর্তে সাইটে" সংখ্যা দেখায়।
// আলাদা টেবিল বা Redis লাগছে না — শুধু একটা in-memory ভ্যারিয়েবল।
let count = 0;

export function setLiveVisitorCount(n: number) {
  count = n;
}

export function liveVisitorCount(): number {
  return count;
}