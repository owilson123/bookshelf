"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Status = "idle" | "parsing" | "importing" | "done" | "error";

export default function ImportPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
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
          // First ensure the DB is initialised
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
      error: (e) => {
        setStatus("error");
        setError(e.message);
      },
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#e6e1d3]">Import from Goodreads</h1>
        <p className="text-[#8b8685] mt-2">
          Export your library from Goodreads (My Books → Import/Export → Export Library) then upload the CSV here.
        </p>
      </div>

      {/* How to export */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 space-y-2 text-sm text-[#8b8685]">
        <p className="text-[#e6e1d3] font-medium">How to get your Goodreads CSV</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to <span className="text-amber-400">goodreads.com</span> → My Books</li>
          <li>Click <span className="font-medium text-[#e6e1d3]">Import and Export</span> (bottom of left sidebar)</li>
          <li>Click <span className="font-medium text-[#e6e1d3]">Export Library</span></li>
          <li>Download the <code className="text-xs bg-white/5 px-1 rounded">.csv</code> file and upload it below</li>
        </ol>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-white/10 hover:border-amber-400/30 rounded-xl p-12 text-center cursor-pointer transition-colors group"
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />

        {status === "idle" && (
          <>
            <Upload className="w-10 h-10 text-white/20 group-hover:text-amber-400/40 mx-auto mb-3 transition-colors" />
            <p className="text-[#e6e1d3] font-medium">Drop your CSV here or click to browse</p>
            <p className="text-sm text-[#8b8685] mt-1">Supports Goodreads export format</p>
          </>
        )}

        {status === "parsing" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-[#8b8685]">Parsing CSV…</p>
          </div>
        )}

        {status === "importing" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-[#e6e1d3] font-medium">Importing {rowCount} books…</p>
            <p className="text-sm text-[#8b8685]">Fetching covers from Google Books — this may take a moment</p>
          </div>
        )}

        {status === "done" && result && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-400" />
            <p className="text-[#e6e1d3] font-medium">Import complete!</p>
            <p className="text-sm text-[#8b8685]">{result.imported} books imported · {result.skipped} skipped</p>
            <button
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); setResult(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="mt-2 text-xs text-amber-400 hover:underline"
            >
              Import another file
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-[#e6e1d3] font-medium">Import failed</p>
            <p className="text-sm text-red-400/80">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); setError(null); }}
              className="mt-2 text-xs text-amber-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-white/30 text-center">
        Your data is stored privately in your own database. Nothing is shared.
      </p>
    </div>
  );
}
