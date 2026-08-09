// Navbar-এর ব্যাকগ্রাউন্ডে ঘনভাবে, কাত হয়ে থাকা স্ট্যাটিক পতাকার প্যাটার্ন — কোনো animation নেই
export default function FlagRibbonBackground({ className = "" }: { className?: string }) {
  const flagTile =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='80' viewBox='0 0 110 80'%3E%3Cg transform='rotate(-16 55 40)'%3E%3Crect x='15' y='22' width='80' height='36' rx='3' fill='%23007a4d'/%3E%3Cellipse cx='47' cy='40' rx='12' ry='12' fill='%23f42a41'/%3E%3C/g%3E%3C/svg%3E"

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("${flagTile}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "88px 64px",
      }}
    />
  )
}