"use client"

import { useState, useRef, useCallback } from "react"

interface Props {
  currentUrl?: string | null
  onUploaded?: (url: string) => void
  size?: number // preview size in px
}

const OUTPUT_SIZE = 300 // 300x300 px
const MAX_KB = 200

export default function ProfileAvatarUpload({ currentUrl, onUploaded, size = 96 }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => fileInputRef.current?.click()

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("শুধু ছবি সিলেক্ট করুন")
      return
    }
    setError("")
    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result as string)
      setZoom(1)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const drawCrop = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !img.complete) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE

    const minSide = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - minSide) / 2
    const sy = (img.naturalHeight - minSide) / 2

    // zoom: larger zoom = tighter crop from center
    const cropSize = minSide / zoom
    const cx = sx + (minSide - cropSize) / 2
    const cy = sy + (minSide - cropSize) / 2

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.save()
    ctx.beginPath()
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, cx, cy, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.restore()
  }, [zoom])

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget
    drawCrop()
  }

  // redraw when zoom changes
  useState(() => {
    // no-op placeholder — zoom effect via onChange below
  })

  async function compressAndUpload() {
    const canvas = canvasRef.current
    if (!canvas) return

    drawCrop()

    setUploading(true)
    setError("")

    try {
      let quality = 0.9
      let blob: Blob | null = null

      // quality কমিয়ে ≤ 200KB না হওয়া পর্যন্ত
      while (quality >= 0.4) {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
        )
        if (blob && blob.size <= MAX_KB * 1024) break
        quality -= 0.1
      }

      if (!blob) {
        setError("ছবি প্রসেস করা যায়নি")
        setUploading(false)
        return
      }

      // এখনো বড় হলে scale কমাও
      if (blob.size > MAX_KB * 1024) {
        const scale = Math.sqrt((MAX_KB * 1024) / blob.size)
        const smallCanvas = document.createElement("canvas")
        const s = Math.max(100, Math.floor(OUTPUT_SIZE * scale))
        smallCanvas.width = s
        smallCanvas.height = s
        const sctx = smallCanvas.getContext("2d")!
        sctx.beginPath()
        sctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
        sctx.closePath()
        sctx.clip()
        sctx.drawImage(canvas, 0, 0, s, s)
        blob = await new Promise<Blob | null>((resolve) =>
          smallCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.8)
        )
      }

      if (!blob || blob.size > MAX_KB * 1024) {
        setError("ছবি ২০০ কেবি-র নিচে আনা যায়নি, অন্য ছবি চেষ্টা করুন")
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", blob, "avatar.jpg")

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "আপলোড ব্যর্থ")
        setUploading(false)
        return
      }

      setPreview(data.avatarUrl)
      setCropSrc(null)
      onUploaded?.(data.avatarUrl)
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Preview circle */}
      <button
        type="button"
        onClick={openPicker}
        className="relative rounded-full overflow-hidden border-2 border-green-200 bg-green-50 hover:border-green-500 transition focus:outline-none"
        style={{ width: size, height: size }}
        title="প্রোফাইল ছবি পরিবর্তন"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-1/2 h-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
        )}
        <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-0.5 text-center">
          চেঞ্জ
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      {/* Crop modal */}
      {cropSrc && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <p className="font-bold text-green-800 text-center text-sm">রাউন্ড ক্রপ করুন</p>

            <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
              {/* hidden full image for measuring */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cropSrc}
                alt="crop"
                className="hidden"
                onLoad={onImgLoad}
              />
              <canvas
                ref={canvasRef}
                width={OUTPUT_SIZE}
                height={OUTPUT_SIZE}
                className="w-full h-full rounded-full border-2 border-green-300"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">জুম</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => {
                  setZoom(parseFloat(e.target.value))
                  setTimeout(drawCrop, 0)
                }}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCropSrc(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
                disabled={uploading}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={compressAndUpload}
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-green-700 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50"
              >
                {uploading ? "আপলোড হচ্ছে..." : "সেভ করুন"}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center">অটো কম্প্রেস · সর্বোচ্চ ২০০ কেবি</p>
          </div>
        </div>
      )}
    </div>
  )
}