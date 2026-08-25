"use client"

import { useEffect, useState } from "react"
import RichTextField from "../components/RichTextField"

type Category = {
  id: number
  name: string
  nameEn?: string | null
  slug: string
  _count?: { items: number }
}

type Item = {
  id: number
  title: string
  titleEn?: string | null
  slug: string
  isPublished: boolean
  category?: Category
  categoryId: number
}

const emptyForm = {
  title: "",
  slug: "",
  titleEn: "",
  slugEn: "",
  titleBanglish: "",
  content: "",
  contentEn: "",
  image: "",
  scientificName: "",
  season: "",
  region: "",
  uses: "",
  categoryId: "",
  isPublished: false,
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
}

export default function AdminBanglarFosolPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatNameEn, setNewCatNameEn] = useState("")
  const [creatingCat, setCreatingCat] = useState(false)

  async function loadAll() {
    const [cRes, iRes] = await Promise.all([
      fetch("/api/admin/fosol-categories"),
      fetch("/api/admin/fosol-items"),
    ])
    if (cRes.ok) setCategories(await cRes.json())
    if (iRes.ok) setItems(await iRes.json())
  }

  useEffect(() => {
    loadAll()
  }, [])

  function generateSlug() {
    return `fosol-${Date.now()}`
  }

  function generateSlugEn(titleEn: string) {
    return titleEn
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  async function createCategoryInline() {
    if (!newCatName.trim()) return
    setCreatingCat(true)
    const res = await fetch("/api/admin/fosol-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCatName.trim(),
        nameEn: newCatNameEn.trim() || null,
      }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories((prev) => [...prev, cat])
      setForm((prev) => ({ ...prev, categoryId: String(cat.id) }))
      setNewCatName("")
      setNewCatNameEn("")
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || "ক্যাটাগরি তৈরি হয়নি")
    }
    setCreatingCat(false)
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.categoryId) {
      alert("শিরোনাম ও ক্যাটাগরি দিন")
      return
    }
    setLoading(true)
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      slug: form.slug || generateSlug(),
    }
    const url = editingId ? `/api/admin/fosol-items/${editingId}` : "/api/admin/fosol-items"
    const method = editingId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setForm(emptyForm)
      setEditingId(null)
      await loadAll()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || "সংরক্ষণ ব্যর্থ")
    }
    setLoading(false)
  }

  function handleEdit(item: any) {
    setEditingId(item.id)
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      titleEn: item.titleEn || "",
      slugEn: item.slugEn || "",
      titleBanglish: item.titleBanglish || "",
      content: item.content || "",
      contentEn: item.contentEn || "",
      image: item.image || "",
      scientificName: item.scientificName || "",
      season: item.season || "",
      region: item.region || "",
      uses: item.uses || "",
      categoryId: String(item.categoryId),
      isPublished: !!item.isPublished,
      isFeatured: !!item.isFeatured,
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleDelete(id: number) {
    if (!confirm("মুছে ফেলবেন?")) return
    await fetch(`/api/admin/fosol-items/${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">বাংলার ফসল ম্যানেজমেন্ট</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-green-700 mb-4">
          {editingId ? "এডিট করুন" : "নতুন আইটেম যোগ করুন"}
        </h2>

        <div className="flex flex-col gap-4">
          <input
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                title: e.target.value,
                slug: p.slug || generateSlug(),
              }))
            }
            placeholder="শিরোনাম (বাংলা)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />
          <input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="Slug"
            className="border border-gray-200 rounded-lg px-4 py-2 text-gray-500 outline-none focus:border-green-500"
          />
          <input
            value={form.titleEn}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                titleEn: e.target.value,
                slugEn: generateSlugEn(e.target.value),
              }))
            }
            placeholder="Title (English)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />
          <input
            value={form.slugEn}
            onChange={(e) => setForm((p) => ({ ...p, slugEn: e.target.value }))}
            placeholder="Slug (English)"
            className="border border-gray-200 rounded-lg px-4 py-2 text-gray-500 outline-none focus:border-green-500"
          />

          {/* Category dropdown + inline create */}
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
            >
              <option value="">ক্যাটাগরি সিলেক্ট করুন</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.nameEn ? `(${c.nameEn})` : ""}
                </option>
              ))}
            </select>
            <div className="flex flex-col gap-2 border border-dashed border-green-300 rounded-lg p-2 bg-green-50/50">
              <span className="text-xs font-semibold text-green-800">নতুন ক্যাটাগরি</span>
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="নাম (বাংলা)"
                className="border border-gray-200 rounded px-3 py-1.5 text-sm outline-none"
              />
              <input
                value={newCatNameEn}
                onChange={(e) => setNewCatNameEn(e.target.value)}
                placeholder="Name (English)"
                className="border border-gray-200 rounded px-3 py-1.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={createCategoryInline}
                disabled={creatingCat}
                className="bg-green-700 text-white text-sm font-bold px-3 py-1.5 rounded hover:bg-green-600"
              >
                {creatingCat ? "বানাচ্ছে..." : "+ ক্যাটাগরি যোগ"}
              </button>
            </div>
          </div>

          {/* Image upload — phone / laptop */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <label className="block text-sm font-medium text-gray-700">ছবি (ঐচ্ছিক)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                try {
                  const fd = new FormData()
                  fd.append("file", file)
                  fd.append("name", form.slug || form.title || "banglar-fosol")
                  const res = await fetch("/api/upload", { method: "POST", body: fd })
                  const data = await res.json()
                  if (res.ok && data.imageUrl) {
                    setForm((p) => ({ ...p, image: data.imageUrl }))
                  } else {
                    alert(data.error || "ছবি আপলোড হয়নি")
                  }
                } catch {
                  alert("ছবি আপলোডে সমস্যা হয়েছে")
                } finally {
                  setUploading(false)
                  e.target.value = ""
                }
              }}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-700 file:text-white file:font-bold file:cursor-pointer hover:file:bg-green-600"
            />
            {uploading && (
              <p className="text-xs text-green-700 font-medium">আপলোড হচ্ছে...</p>
            )}
            {form.image && (
              <div className="flex items-start gap-3 mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-28 h-28 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, image: "" }))}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  ছবি সরান
                </button>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              value={form.scientificName}
              onChange={(e) => setForm((p) => ({ ...p, scientificName: e.target.value }))}
              placeholder="বৈজ্ঞানিক নাম"
              className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
            />
            <input
              value={form.season}
              onChange={(e) => setForm((p) => ({ ...p, season: e.target.value }))}
              placeholder="মৌসুম"
              className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
            />
            <input
              value={form.region}
              onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
              placeholder="অঞ্চল"
              className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
            />
          </div>
          <input
            value={form.uses}
            onChange={(e) => setForm((p) => ({ ...p, uses: e.target.value }))}
            placeholder="ব্যবহার (খাদ্য / ঔষধ / অন্যান্য)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />

          <RichTextField
            value={form.content}
            onChange={(val) => setForm((p) => ({ ...p, content: val }))}
            placeholder="কনটেন্ট (বাংলা) — bold, link, italic..."
            rows={8}
          />
          <RichTextField
            value={form.contentEn}
            onChange={(val) => setForm((p) => ({ ...p, contentEn: val }))}
            placeholder="Content (English)"
            rows={8}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
            />
            Publish করবেন?
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
            />
            Featured?
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-bold"
            >
              {loading ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold"
              >
                বাতিল
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-green-700 mb-4">সব আইটেম ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-gray-400">এখনো কোনো আইটেম নেই।</p>
        ) : (
          <div className="flex flex-col divide-y">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-green-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.category?.name || "—"} · {item.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => handleEdit(item)} className="text-green-600 text-sm font-bold">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}