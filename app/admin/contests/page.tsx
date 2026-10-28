"use client";
import { useState, useEffect } from "react";
import RichTextField from "../components/RichTextField";

const TYPE_LABEL: Record<string, string> = {
  CONTEST: "প্রতিযোগিতা",
  OFFER: "অফার",
  NEWS: "খবর",
};

const EMPTY_FORM = {
  type: "CONTEST",
  title: "",
  titleEn: "",
  slug: "",
  summary: "",
  summaryEn: "",
  content: "",
  contentEn: "",
  image: "",
  posterImage: "",
  facebookUrl: "",
  youtubeUrl: "",
  startsAt: "",
  endsAt: "",
  winners: "",
  winnersEn: "",
  isPinned: false,
  isPublished: false,
};

// ISO → datetime-local ইনপুটের মান (লোকাল সময়)
function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

const inputCls =
  "border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500";

export default function AdminContestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  async function loadItems() {
    const res = await fetch("/api/contests");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  // ইংরেজি শিরোনাম লিখলে slug নিজে বসবে (পরে হাতে বদলানো যাবে)
  function slugFrom(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  }

  async function handleUpload(field: "image" | "posterImage", file?: File) {
    if (!file) return;
    setUploading(field);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", form.slug || "contest");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm((p) => ({ ...p, [field]: data.imageUrl }));
      } else {
        alert(data.error || "ছবি আপলোড হয়নি");
      }
    } catch {
      alert("ছবি আপলোডে সমস্যা হয়েছে");
    } finally {
      setUploading("");
    }
  }

  async function handleSubmit() {
    setLoading(true);
    const payload = {
      ...form,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : "",
    };
    const res = await fetch(
      editingId ? `/api/contests/${editingId}` : "/api/contests",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (res.ok) {
      setForm({ ...EMPTY_FORM });
      setEditingId(null);
      await loadItems();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "সংরক্ষণ হয়নি");
    }
    setLoading(false);
  }

  function handleEdit(item: any) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      title: item.title,
      titleEn: item.titleEn || "",
      slug: item.slug,
      summary: item.summary || "",
      summaryEn: item.summaryEn || "",
      content: item.content,
      contentEn: item.contentEn || "",
      image: item.image || "",
      posterImage: item.posterImage || "",
      facebookUrl: item.facebookUrl || "",
      youtubeUrl: item.youtubeUrl || "",
      startsAt: toLocalInput(item.startsAt),
      endsAt: toLocalInput(item.endsAt),
      winners: item.winners || "",
      winnersEn: item.winnersEn || "",
      isPinned: item.isPinned,
      isPublished: item.isPublished,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete করবেন?")) return;
    const res = await fetch(`/api/contests/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function ImageField({
    field,
    label,
  }: {
    field: "image" | "posterImage";
    label: string;
  }) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <input
          name={field}
          value={form[field]}
          onChange={handleChange}
          placeholder="ছবির URL (অথবা নিচে থেকে আপলোড করুন)"
          className={inputCls}
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading === field}
          onChange={(e) => {
            handleUpload(field, e.target.files?.[0]);
            e.target.value = "";
          }}
          className="text-sm"
        />
        {uploading === field && (
          <p className="text-xs text-gray-500">আপলোড হচ্ছে...</p>
        )}
        {form[field] && (
          <img
            src={form[field]}
            alt=""
            className="h-24 w-auto rounded border object-cover self-start"
          />
        )}
      </div>
    );
  }

  const now = Date.now();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        প্রতিযোগিতা / অফার / খবর
      </h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-green-700 mb-4">
          {editingId ? "এডিট করুন" : "নতুন যোগ করুন"}
        </h2>
        <div className="flex flex-col gap-4">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="CONTEST">প্রতিযোগিতা</option>
            <option value="OFFER">অফার</option>
            <option value="NEWS">খবর</option>
          </select>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="বাংলা শিরোনাম"
            className={inputCls}
          />
          <input
            name="titleEn"
            value={form.titleEn}
            onChange={(e) => {
              handleChange(e);
              if (!editingId) {
                setForm((p) => ({ ...p, slug: slugFrom(e.target.value) }));
              }
            }}
            placeholder="English Title"
            className={inputCls}
          />
          <div>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="slug (যেমন first-video-giveaway)"
              className={`${inputCls} w-full text-gray-500`}
            />
            <p className="text-xs text-gray-400 mt-1">
              লিংক হবে /contests/slug ও /en/contests/slug। ইংরেজি ছোট হাতের
              অক্ষর, সংখ্যা ও হাইফেন।
            </p>
          </div>

          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="সংক্ষিপ্ত বিবরণ (বাংলা, তালিকায় দেখাবে)"
            rows={2}
            className={inputCls}
          />
          <textarea
            name="summaryEn"
            value={form.summaryEn}
            onChange={handleChange}
            placeholder="Short summary (English)"
            rows={2}
            className={inputCls}
          />

          <RichTextField
            value={form.content}
            onChange={(val) => setForm((p) => ({ ...p, content: val }))}
            placeholder="বিস্তারিত লিখুন (বাংলা)..."
            rows={8}
          />
          <RichTextField
            value={form.contentEn}
            onChange={(val) => setForm((p) => ({ ...p, contentEn: val }))}
            placeholder="Write details in English..."
            rows={8}
          />

          <ImageField field="posterImage" label="পোস্টার ছবি" />
          <ImageField field="image" label="কভার ছবি (তালিকার জন্য, ঐচ্ছিক)" />

          <input
            name="facebookUrl"
            value={form.facebookUrl}
            onChange={handleChange}
            placeholder="Facebook ভিডিও/পেজ লিংক (https://...)"
            className={inputCls}
          />
          <input
            name="youtubeUrl"
            value={form.youtubeUrl}
            onChange={handleChange}
            placeholder="YouTube ভিডিও/চ্যানেল লিংক (https://...)"
            className={inputCls}
          />

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                শুরুর সময় (ঐচ্ছিক)
              </label>
              <input
                type="datetime-local"
                name="startsAt"
                value={form.startsAt}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                শেষ সময় (ঐচ্ছিক)
              </label>
              <input
                type="datetime-local"
                name="endsAt"
                value={form.endsAt}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-700">
            বিজয়ী ঘোষণা (ড্র শেষে লিখুন, খালি থাকলে পেজে দেখাবে না)
          </p>
          <RichTextField
            value={form.winners}
            onChange={(val) => setForm((p) => ({ ...p, winners: val }))}
            placeholder="বিজয়ীদের নাম ও পুরস্কার (বাংলা)..."
            rows={4}
          />
          <RichTextField
            value={form.winnersEn}
            onChange={(val) => setForm((p) => ({ ...p, winnersEn: val }))}
            placeholder="Winners (English)..."
            rows={4}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPinned"
              checked={form.isPinned}
              onChange={handleChange}
            />
            তালিকার ওপরে পিন করবেন?
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            Publish করবেন?
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-bold"
            >
              {loading
                ? "সংরক্ষণ হচ্ছে..."
                : editingId
                  ? "আপডেট করুন"
                  : "সংরক্ষণ করুন"}
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

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-700">সব আইটেম</h2>
          <span className="text-sm text-gray-500">মোট: {items.length} টি</span>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-400">কিছু নেই।</p>
        ) : (
          <div className="flex flex-col border border-gray-100 rounded-lg overflow-hidden">
            {items.map((item) => {
              const ended = item.endsAt && new Date(item.endsAt).getTime() < now;
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 border-b border-gray-50 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-green-800 text-sm leading-tight">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      /contests/{item.slug}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {TYPE_LABEL[item.type] || item.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        item.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                    {item.isPinned && (
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                        পিন
                      </span>
                    )}
                    {ended && (
                      <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                        শেষ
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-green-600 hover:text-green-800 text-sm font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}