"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, CheckCircle, AlertCircle, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type Status = "idle" | "parsing" | "importing" | "done" | "error";

export default function ImportPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("parsing");
    setError(null);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const rows = parsed.data as Record<string, string>[];
        setRowCount(rows.length);

        if (rows.length === 0) {
          setStatus("error");
          setError("No rows found in the CSV. Make sure it's a valid Goodreads export.");
          return;
        }

        setStatus("importing");
        try {
          await fetch("/api/init", { method: "POST" });
          const res = await fetch("/api/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error ?? "Import failed");
          }
          const data = await res.json();
          setResult(data);
          setStatus("done");
          toast.success(`Imported ${data.imported} book${data.imported !== 1 ? "s" : ""}`);
        } catch (e) {
          setStatus("error");
          setError(String(e));
          toast.error("Import failed");
        }
      },
      error: (e) => { setStatus("error"); setError(e.message); },
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const busy = status === "parsing" || status === "importing";

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Import Library</h1>
        <p className="text-white/40 mt-2 text-[15px]">Bring your Goodreads books in with one CSV upload.</p>
      </div>

      {/* How-to steps */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[13px] font-semibold text-white/70 mb-4">How to export from Goodreads</p>
        {[
          "Go to goodreads.com → My Books",
          "Click Import and Export in the left sidebar",
          'Click "Export Library" and download the .csv file',
          "Upload it below — we'll fetch covers automatically",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-amber-400"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
              {i + 1}
            </div>
            <p className="text-[13px] text-white/45 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }}
        onClick={() => !busy && fileRef.current?.click()}
        className="relative rounded-2xl p-12 text-center transition-all duration-200 overflow-hidden"
        style={{
          background: dragging ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)",
          border: `2px dashed ${dragging ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
          cursor: busy ? "default" : "pointer",
        }}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />

        {status === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200"
              style={{
                background: dragging ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${dragging ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
              }}>
              <Upload className={`w-7 h-7 transition-colors ${dragging ? "text-amber-400" : "text-white/25"}`} />
            </div>
            <div>
              <p className="text-white/70 font-semibold text-[15px]">
                {dragging ? "Drop to import" : "Drop your CSV here"}
              </p>
              <p className="text-white/30 text-[13px] mt-1">or click to browse</p>
            </div>
            <p className="text-[11px] text-red-400/50 mt-1">⚠ This will replace your entire current library</p>
          </div>
        )}

        {(status === "parsing" || status === "importing") && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            </div>
            <div>
              <p className="text-white/80 font-semibold text-[15px]">
                {status === "parsing" ? "Reading CSV…" : `Importing ${rowCount} books…`}
              </p>
              {status === "importing" && (
                <p className="text-white/35 text-[13px] mt-1">Fetching covers from Google Books</p>
              )}
            </div>
          </div>
        )}

        {status === "done" && result && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/80 font-semibold text-[15px]">Import complete!</p>
              <p className="text-white/40 text-[13px] mt-1">
                {result.imported} books imported · {result.skipped} skipped
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <a href="/" className="flex items-center gap-2 text-[13px] font-medium text-amber-400 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                View my shelves <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); setStatus("idle"); setResult(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-[13px] text-white/40 hover:text-white/60 px-4 py-2 rounded-xl transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                Import another
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <p className="text-white/80 font-semibold text-[15px]">Import failed</p>
              <p className="text-red-400/70 text-[13px] mt-1 max-w-xs">{error}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); setError(null); }}
              className="text-[13px] text-amber-400 hover:underline mt-1">
              Try again
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-[12px] text-white/20">
        Your data is stored privately in your own database.
      </p>
    </div>
  );
}
