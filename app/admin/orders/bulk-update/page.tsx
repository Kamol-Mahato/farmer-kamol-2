"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SAMPLE_CSV_STATUS =
  "Order ID,Amount,Status\nFK20260721001,850,DELIVERED\nFK20260721002,,CANCELLED\n";
const SAMPLE_CSV_COURIER =
  "Order ID,Courier Paid Amount\nFK20260721001,850\nFK20260721002,700\n";

type UpdateMode = "STATUS" | "COURIER_PAYMENT";

interface CsvRow {
  orderIdRaw: string;
  amount: string;
  status: string;
  courierPaidAmount: string;
}

interface RowResult {
  orderIdRaw: string;
  success: boolean;
  reason?: string;
}

export default function AdminBulkUpdatePage() {
  const router = useRouter();
  const [mode, setMode] = useState<UpdateMode>("STATUS");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<CsvRow[]>([
    { orderIdRaw: "", amount: "", status: "", courierPaidAmount: "" },
  ]);
  const [inputMethod, setInputMethod] = useState<"manual" | "csv">("manual");
  const [previewResults, setPreviewResults] = useState<RowResult[] | null>(
    null,
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  function downloadSample() {
    const csv =
      mode === "COURIER_PAYMENT" ? SAMPLE_CSV_COURIER : SAMPLE_CSV_STATUS;
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Farmer Kamol Bulk Update Sample File.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function addManualRow() {
    setRows((prev) => [
      ...prev,
      { orderIdRaw: "", amount: "", status: "", courierPaidAmount: "" },
    ]);
    setPreviewResults(null);
  }

  function updateManualRow(index: number, field: keyof CsvRow, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setPreviewResults(null);
  }

  function removeManualRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setPreviewResults(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setPreviewResults(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const parsed = lines
        .slice(1)
        .map((line) => {
          if (mode === "COURIER_PAYMENT") {
            const [orderIdRaw, courierPaidAmount] = line
              .split(",")
              .map((s) => s.trim());
            return {
              orderIdRaw: orderIdRaw || "",
              amount: "",
              status: "",
              courierPaidAmount: courierPaidAmount || "",
            };
          }
          const [orderIdRaw, amount, status] = line
            .split(",")
            .map((s) => s.trim());
          return {
            orderIdRaw: orderIdRaw || "",
            amount: amount || "",
            status: status || "",
            courierPaidAmount: "",
          };
        })
        .filter((r) => r.orderIdRaw);
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  // 🔍 ধাপ ১: প্রিভিউ — সার্ভারে dryRun পাঠিয়ে যাচাই করা, কিছু আপডেট হবে না
  async function handlePreview() {
    const validRows = rows.filter((r) => r.orderIdRaw.trim());
    if (validRows.length === 0) {
      alert(
        inputMethod === "manual"
          ? "কমপক্ষে একটা Order ID লিখুন"
          : "প্রথমে একটা CSV ফাইল আপলোড করুন",
      );
      return;
    }
    // খালি সারি বাদ দিয়ে পাঠাও
    setRows(validRows);
    setPreviewLoading(true);
    setPreviewResults(null);
    try {
      const res = await fetch("/api/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows, dryRun: true, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "যাচাই করা যায়নি");
        return;
      }
      setPreviewResults(data.results);
    } catch {
      alert("সার্ভার সমস্যা হয়েছে");
    } finally {
      setPreviewLoading(false);
    }
  }

  // ✅ ধাপ ২: Submit — আসল আপডেট, শুধু প্রিভিউ সব সবুজ হলেই সক্রিয়
  async function handleSubmit() {
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: rows.filter((r) => r.orderIdRaw.trim()),
          dryRun: false,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "আপডেট করা যায়নি");
        return;
      }
      const failed = (data.results as RowResult[]).filter((r) => !r.success);
      if (failed.length > 0) {
        alert(
          `কিছু সারি আপডেট হয়নি:\n${failed.map((f) => `${f.orderIdRaw}: ${f.reason}`).join("\n")}`,
        );
      }
      router.push("/admin/orders");
    } catch {
      alert("সার্ভার সমস্যা হয়েছে");
    } finally {
      setSubmitLoading(false);
    }
  }

  const allValid =
    previewResults !== null && previewResults.every((r) => r.success);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-black mb-6">Bulk Order Update</h1>

      <div className="bg-white border border-black rounded-xl p-6 space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-800 mb-1">আপডেট মোড</p>
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as UpdateMode);
              setFileName("");
              setRows([
                {
                  orderIdRaw: "",
                  amount: "",
                  status: "",
                  courierPaidAmount: "",
                },
              ]);
              setPreviewResults(null);
              setInputMethod("manual");
            }}
            className="border border-gray-400 rounded-lg text-sm px-3 py-2"
          >
            <option value="STATUS">স্ট্যাটাস ও Amount আপডেট</option>
            <option value="COURIER_PAYMENT">Courier Payment আপডেট</option>
          </select>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 mb-1">Sample file</p>
          <button
            onClick={downloadSample}
            className="text-sm underline text-black font-medium"
          >
            Click here to download sample file
          </button>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 mb-2">ইনপুট পদ্ধতি</p>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setInputMethod("manual");
                setFileName("");
                if (rows.length === 0) {
                  setRows([
                    {
                      orderIdRaw: "",
                      amount: "",
                      status: "",
                      courierPaidAmount: "",
                    },
                  ]);
                }
                setPreviewResults(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold border ${
                inputMethod === "manual"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              ম্যানুয়াল ইনপুট
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMethod("csv");
                setPreviewResults(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold border ${
                inputMethod === "csv"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              CSV আপলোড
            </button>
          </div>

          {inputMethod === "manual" ? (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="py-2 px-3">Order ID</th>
                      {mode === "COURIER_PAYMENT" ? (
                        <th className="py-2 px-3">Courier Paid Amount</th>
                      ) : (
                        <>
                          <th className="py-2 px-3">Amount</th>
                          <th className="py-2 px-3">Status</th>
                        </>
                      )}
                      <th className="py-2 px-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rows.length
                      ? rows
                      : [
                          {
                            orderIdRaw: "",
                            amount: "",
                            status: "",
                            courierPaidAmount: "",
                          },
                        ]
                    ).map((row, i) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={row.orderIdRaw}
                            onChange={(e) =>
                              updateManualRow(i, "orderIdRaw", e.target.value)
                            }
                            placeholder="FK20260721001"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                          />
                        </td>
                        {mode === "COURIER_PAYMENT" ? (
                          <td className="py-1.5 px-2">
                            <input
                              type="number"
                              value={row.courierPaidAmount}
                              onChange={(e) =>
                                updateManualRow(
                                  i,
                                  "courierPaidAmount",
                                  e.target.value,
                                )
                              }
                              placeholder="850"
                              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                            />
                          </td>
                        ) : (
                          <>
                            <td className="py-1.5 px-2">
                              <input
                                type="number"
                                value={row.amount}
                                onChange={(e) =>
                                  updateManualRow(i, "amount", e.target.value)
                                }
                                placeholder="850"
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                              />
                            </td>
                            <td className="py-1.5 px-2">
                              <select
                                value={row.status}
                                onChange={(e) =>
                                  updateManualRow(i, "status", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                              >
                                <option value="">সিলেক্ট</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="PAID_RETURN">PAID_RETURN</option>
                                <option value="RETURNED">RETURNED</option>
                              </select>
                            </td>
                          </>
                        )}
                        <td className="py-1.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeManualRow(i)}
                            className="text-red-600 font-bold text-lg leading-none px-2"
                            title="মুছুন"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addManualRow}
                className="text-sm font-bold underline text-black"
              >
                + আরেকটা সারি যোগ করুন
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">CSV file</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="border border-gray-400 rounded-lg text-sm w-full px-3 py-2"
              />
              {fileName && (
                <p className="text-xs text-gray-500 mt-1">
                  সিলেক্টেড: {fileName} ({rows.length}টি সারি পাওয়া গেছে)
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handlePreview}
          disabled={previewLoading}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
        >
          {previewLoading ? "যাচাই হচ্ছে..." : "Update"}
        </button>
      </div>

      {/* 🔍 প্রিভিউ টেবিল */}
      {previewResults && (
        <div className="bg-white border border-gray-300 rounded-xl p-6 mt-6">
          <h2 className="font-bold text-gray-800 mb-4">
            প্রিভিউ — সাবমিট করার আগে যাচাই করে নিন
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2">Order ID</th>
                {mode === "COURIER_PAYMENT" ? (
                  <th className="py-2">Courier Paid Amount</th>
                ) : (
                  <>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                  </>
                )}
                <th className="py-2">যাচাই</th>
                <th className="py-2">রিমার্কস</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const result = previewResults[i];
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{row.orderIdRaw}</td>
                    {mode === "COURIER_PAYMENT" ? (
                      <td className="py-2">{row.courierPaidAmount || "-"}</td>
                    ) : (
                      <>
                        <td className="py-2">{row.amount || "-"}</td>
                        <td className="py-2">{row.status}</td>
                      </>
                    )}
                    <td className="py-2 font-bold">
                      {result?.success ? (
                        <span className="text-green-700">✅</span>
                      ) : (
                        <span className="text-red-600">❌</span>
                      )}
                    </td>
                    <td
                      className={`py-2 ${result?.success ? "text-gray-500" : "text-red-600 font-medium"}`}
                    >
                      {result?.reason || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!allValid && (
            <p className="text-red-600 text-sm font-bold mt-4">
              ❌ কিছু সারিতে সমস্যা আছে — Submit করার আগে CSV ফাইল ঠিক করে আবার
              আপলোড করুন।
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!allValid || submitLoading}
            className="mt-4 bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitLoading ? "সাবমিট হচ্ছে..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
