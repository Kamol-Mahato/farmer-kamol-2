import { randomInt, createHash, timingSafeEqual } from "crypto"

export function generateOTP() {
  return randomInt(100000, 1000000).toString()
}

export function getOTPExpiry() {
  return new Date(Date.now() + 5 * 60 * 1000)
}

/** OTP DB-তে প্লেইন রাখবে না — hash করে রাখবে */
export function hashOtp(otp: string): string {
  return createHash("sha256").update(otp.trim()).digest("hex")
}

/** timing-safe compare */
export function verifyOtpHash(plainOtp: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false
  const a = Buffer.from(hashOtp(plainOtp))
  const b = Buffer.from(storedHash)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}