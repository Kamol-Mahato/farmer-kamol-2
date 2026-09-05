import { NextResponse } from "next/server";

// Lightweight health-check for uptime pingers (e.g. UptimeRobot).
// Deliberately does NOT touch the database or Redis — its only job is to
// prove the Node process is awake, so it doesn't add to DB connection
// pressure every time it's pinged.
export async function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
