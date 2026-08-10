"use client"
import { useUnreadCustomerChat } from "../../components/useUnreadCustomerChat"

export default function AgentChatDashboardCard() {
  const unread = useUnreadCustomerChat()
  return (
    <a href="/agent/chat" className="block bg-white p-6 rounded-2xl border border-black hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">লাইভ চ্যাট</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">
            {unread > 0 ? `${unread} নতুন` : "দেখুন"}
          </h3>
        </div>
        <div className="relative p-3 bg-gray-100 rounded-xl text-black">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-black mt-4 font-bold">→ কাস্টমারের মেসেজ দেখুন ও রিপ্লাই দিন</p>
    </a>
  )
}