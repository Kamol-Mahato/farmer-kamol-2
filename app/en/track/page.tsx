"use client"

import { useState } from "react"
import Link from "next/link"

const STATUS_EN: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DELIVERY_ONGOING: "Out for Delivery",
  DELIVERED: "Delivered",
  PAID_RETURN: "Paid Return",
  PARTIAL_DELIVERY: "Partial Delivery",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  LOST: "Lost",
  DAMAGED: "Damaged",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  DELIVERY_ONGOING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  PAID_RETURN: "bg-orange-50 text-orange-700 border-orange-200",
  PARTIAL_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
  RETURNED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
  LOST: "bg-red-50 text-red-700 border-red-200",
  DAMAGED: "bg-red-50 text-red-700 border-red-200",
}

interface TrackResult {
  orderId: string
  orderStatus: string
  courierProvider: string | null
  courierStatus: string | null
  createdAt: string
}

export default function TrackPageEn() {
  const [orderId, setOrderId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<TrackResult | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = orderId.trim()
    if (!trimmed) {
      setError("Please enter Order ID")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setResult(data)
    } catch {
      setError("Could not connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-green-800 text-center mb-2">Track Your Order</h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        Login to see full history, or search by Order ID for status only.
      </p>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <Link
          href="/en/customer/dashboard"
          className="bg-green-700 text-white rounded-2xl p-5 text-center font-bold hover:bg-green-600 transition shadow-sm"
        >
          🔐 Login to View My Orders
          <p className="text-green-100 text-xs font-normal mt-1">Full history & details</p>
        </Link>

        <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
          <p className="font-bold text-green-800 text-center mb-1">📦 Search by Order ID</p>
          <p className="text-xs text-gray-500 text-center mb-4">No login needed — status only</p>

          <form onSubmit={handleSearch} className="space-y-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="e.g. FK202608181"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 tracking-wider font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "🔍 Check Status"}
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-sm text-center mt-3 font-medium">{error}</p>
          )}

          {result && (
            <div className="mt-5 bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Order ID</span>
                <span className="font-bold text-gray-900 tracking-wider">{result.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Date</span>
                <span className="text-sm text-gray-700">
                  {new Date(result.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Status</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    STATUS_COLOR[result.orderStatus] || "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {STATUS_EN[result.orderStatus] || result.orderStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Courier</span>
                <span className="text-sm font-medium text-gray-700">
                  {result.courierProvider || result.courierStatus
                    ? `${result.courierProvider || ""}${
                        result.courierProvider && result.courierStatus ? " • " : ""
                      }${result.courierStatus || ""}`
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}