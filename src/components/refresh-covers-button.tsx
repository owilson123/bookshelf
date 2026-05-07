"use client";

import { useState } from "react";
import { ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RefreshCoversButton({ missingCount }: { missingCount: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (missingCount === 0 || done) return null;

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/covers/refresh", { method: "POST" });
      const data = await res.json();
      if (data.updated > 0) {
        toast.success(`Found covers for ${data.updated} book${data.updated !== 1 ? "s" : ""}`);
        router.refresh();
      } else {
        toast.info("No new covers found");
      }
      if (data.remaining === 0) setDone(true);
    } catch {
      toast.error("Cover refresh failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={refresh}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <ImageIcon className="w-3.5 h-3.5" />}
      {loading ? "Fetching covers…" : `Find covers (${missingCount} missing)`}
    </button>
  );
}
