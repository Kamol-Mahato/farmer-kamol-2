"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RichTextField from "../components/RichTextField"

export default function AdminBlogPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<any[]>([])
  const [dbCategories, setDbCategories] = useState<any[]>([]) // ১. ক্যাটাগরির জন্য নতুন স্টেট
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false) // নতুন
  const INITIAL_LIMIT = 20 // চাইলে 20 বা 30 করো
  const [form, setForm] = useState({
    title: "",
    slug: "",
    titleEn: "",
    slugEn: "",
    titleBanglish: "",
    content: "",
    contentEn: "",
    image: "",
    category: "",
    isPublished: false,
    homeOrder: "" as string | number,
  })

  // ২. ব্লগ লিস্ট এবং ক্যাটাগরি লিস্ট ফেচ করা
  useEffect(() => {
    // ব্লগ ফেচ করা
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => setBlogs(data))

    // ডাটাবেজ থেকে ক্যাটাগরি ফেচ করা
    fetch("/api/categories") // আপনার ক্যাটাগরি API রুট অনুযায়ী পাথ দিন
      .then(res => res.json())
      .then(data => setDbCategories(data))
      .catch(err => console.error("ক্যাটাগরি লোড করতে সমস্যা হয়েছে:", err))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function generateSlug(title: string) {
    const timestamp = Date.now()
    return `blog-${timestamp}`
  }

  // ✅ English slug সঠিকভাবে titleEn থেকে বানানো (SEO-friendly)
  function generateSlugEn(titleEn: string) {
    return titleEn
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  async function handleSubmit() {
    setLoading(true)
    const url = editingId ? `/api/blog/${editingId}` : "/api/blog"
    const method = editingId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ title: "", slug: "", titleEn: "", slugEn: "", titleBanglish: "", content: "", contentEn: "", image: "", category: "", isPublished: false, homeOrder: "" })
      setEditingId(null)
      const data = await fetch("/api/blog").then(r => r.json())
      setBlogs(data)
    }
    setLoading(false)
  }

  function handleEdit(blog: any) {
    setEditingId(blog.id)
    setForm({
      title: blog.title,
      slug: blog.slug,
      titleEn: blog.titleEn || "",
      slugEn: blog.slugEn || "",
      titleBanglish: blog.titleBanglish || "",
      content: blog.content,
      contentEn: blog.contentEn || "",
      image: blog.image || "",
      category: blog.category,
      isPublished: blog.isPublished,
      homeOrder: blog.homeOrder ?? "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm({ title: "", slug: "", titleEn: "", slugEn: "", titleBanglish: "", content: "", contentEn: "", image: "", category: "", isPublished: false, homeOrder: "" })
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete করবেন?")) return
    await fetch(`/api/blog/${id}`, { method: "DELETE" })
    setBlogs(blogs.filter(b => b.id !== id))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Blog Management</h1>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-lg font-bold text-green-700 mb-4">
          {editingId ? "Blog এডিট করুন" : "নতুন Blog লিখুন"}
        </h2>
        <div className="flex flex-col gap-4">
          <input
            name="title"
            value={form.title}
            onChange={e => {
              handleChange(e)
              setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
            }}
            placeholder="Blog এর শিরোনাম"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug (auto)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500 text-gray-400"
          />

          <input
            name="titleBanglish"
            value={form.titleBanglish}
            onChange={handleChange}
            placeholder="শিরোনাম (Banglish, ঐচ্ছিক)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />

          <input
            name="titleEn"
            value={form.titleEn}
            onChange={e => {
              handleChange(e)
              setForm(prev => ({ ...prev, slugEn: generateSlugEn(e.target.value) }))
            }}
            placeholder="Blog Title (English)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />

          <input
            name="slugEn"
            value={form.slugEn}
            onChange={handleChange}
            placeholder="Slug (English URL, auto)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500 text-gray-400"
          />

          {/* ৩. সম্পূর্ণ অটোমেটেড সিলেক্ট বক্স */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          >
            <option value="">Category select করুন</option>
            {dbCategories.map((cat: any) => (
              <option key={cat.id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL (optional)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />
          <RichTextField
            value={form.content}
            onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
            placeholder="Blog এর content লিখুন..."
            rows={8}
          />

          <RichTextField
            value={form.contentEn}
            onChange={(val) => setForm((prev) => ({ ...prev, contentEn: val }))}
            placeholder="Write blog content in English..."
            rows={8}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            Publish করবেন?
          </label>
          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Home Page PIN (1–6) — খালি রাখলে auto
            </label>
            <input
              type="number"
              min={1}
              max={6}
              name="homeOrder"
              value={form.homeOrder}
              onChange={handleChange}
              placeholder="খালি = PIN নেই"
              className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500 w-40"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-bold"
            >
              {loading ? "সংরক্ষণ হচ্ছে..." : editingId ? "Blog আপডেট করুন" : "Blog সংরক্ষণ করুন"}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-bold"
              >
                বাতিল করুন
              </button>
            )}
          </div>
        </div>
      </div>

{/* Blog List - Excel-like + See More */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-700">সব Blog</h2>
          <span className="text-sm text-gray-500">
            মোট: {blogs.length} টি
            {!showAll && blogs.length > INITIAL_LIMIT && (
              <> · দেখাচ্ছে {INITIAL_LIMIT} টি</>
            )}
          </span>
        </div>

        {blogs.length === 0 ? (
          <p className="text-gray-400">কোনো blog নেই।</p>
        ) : (
          <>
            {/* টেবিল হেডার */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 bg-green-50 rounded-t-lg text-xs font-bold text-green-800 border border-gray-100">
              <div className="col-span-1">#</div>
              <div className="col-span-5">শিরোনাম</div>
              <div className="col-span-2">ক্যাটাগরি</div>
              <div className="col-span-2">স্ট্যাটাস</div>
              <div className="col-span-2 text-right">অ্যাকশন</div>
            </div>

            <div className="flex flex-col border border-gray-100 rounded-b-lg overflow-hidden">
              {(showAll ? blogs : blogs.slice(0, INITIAL_LIMIT)).map((blog, index) => (
                <div
                  key={blog.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center px-3 py-3 border-b border-gray-50 hover:bg-gray-50 transition"
                >
                  <div className="sm:col-span-1 text-xs text-gray-400 font-mono">
                    {index + 1}
                  </div>
                  <div className="sm:col-span-5">
                    <p className="font-bold text-green-800 text-sm leading-tight">{blog.title}</p>
                    {blog.titleEn && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{blog.titleEn}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 text-xs text-gray-500">
                    {blog.category || "—"}
                  </div>
                  <div className="sm:col-span-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        blog.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-green-600 hover:text-green-800 text-sm font-bold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-400 hover:text-red-600 text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* See More / See Less বাটন */}
            {blogs.length > INITIAL_LIMIT && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-5 py-2 rounded-lg border border-green-600 text-green-700 font-bold text-sm hover:bg-green-50 transition"
                >
                  {showAll
                    ? "কম দেখুন (See Less)"
                    : `আরও দেখুন (See More) — বাকি ${blogs.length - INITIAL_LIMIT} টি`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
