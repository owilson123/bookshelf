export const dynamic = "force-dynamic";

import { sql } from "@/lib/db";
import { Book } from "@/lib/types";
import { BarChart2, Star, BookOpen, Clock, TrendingUp, Award, Hash } from "lucide-react";

async function getBooks(): Promise<Book[]> {
  try {
    const rows = await sql`SELECT * FROM books ORDER BY date_added DESC`;
    return rows as unknown as Book[];
  } catch {
    return [];
  }
}

export default async function StatsPage() {
  const books = await getBooks();
  const read = books.filter((b) => b.shelf === "read");
  const rated = read.filter((b) => b.rating && b.rating > 0);
  const avgRating = rated.length > 0
    ? (rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1)
    : "—";
  const totalPages = read.reduce((s, b) => s + (b.page_count ?? 0), 0);

  const byYear: Record<string, number> = {};
  for (const b of read) {
    const year = b.date_read?.slice(0, 4) ?? b.date_added?.slice(0, 4) ?? "Unknown";
    byYear[year] = (byYear[year] ?? 0) + 1;
  }
  const sortedYears = Object.entries(byYear).sort(([a], [b]) => b.localeCompare(a));
  const maxYear = Math.max(...Object.values(byYear), 1);

  const genreCounts: Record<string, number> = {};
  for (const b of books) {
    for (const g of b.genres ?? []) {
      const clean = g.split("/")[0].trim();
      genreCounts[clean] = (genreCounts[clean] ?? 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCounts).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxGenre = Math.max(...topGenres.map(([, c]) => c), 1);

  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const b of rated) if (b.rating) ratingDist[b.rating]++;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Reading Stats</h1>
        <p className="text-white/40 mt-2 text-[15px]">Your reading journey in numbers.</p>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <BarChart2 className="w-9 h-9 text-white/15" />
          </div>
          <p className="text-white/30 text-[15px]">Add some books to see your stats.</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Books Read" value={read.length} sub="finished" icon={BookOpen} color="amber" />
            <StatCard label="Avg Rating" value={avgRating} sub={`${rated.length} rated`} icon={Star} color="amber" />
            <StatCard label="Pages Read" value={totalPages > 999 ? `${(totalPages/1000).toFixed(1)}k` : totalPages} sub="total pages" icon={Hash} color="blue" />
            <StatCard label="Want to Read" value={books.filter(b => b.shelf === "want_to_read").length} sub="on your list" icon={Clock} color="purple" />
          </div>

          {/* Books per year */}
          {sortedYears.length > 0 && (
            <Section label="Books Read Per Year" icon={<TrendingUp className="w-3.5 h-3.5 text-amber-400" />}>
              <div className="space-y-2.5">
                {sortedYears.map(([year, count]) => (
                  <div key={year} className="flex items-center gap-4">
                    <span className="text-[13px] text-white/35 w-10 text-right tabular-nums shrink-0">{year}</span>
                    <div className="flex-1 h-8 rounded-xl overflow-hidden relative"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div
                        className="h-full rounded-xl flex items-center px-3 transition-all duration-700"
                        style={{
                          width: `${Math.max(6, (count / maxYear) * 100)}%`,
                          background: "linear-gradient(90deg, rgba(217,119,6,0.7), rgba(245,158,11,0.5))",
                        }}
                      >
                        <span className="text-[12px] font-semibold text-amber-200/80">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rating distribution */}
            {rated.length > 0 && (
              <Section label="Rating Distribution" icon={<Star className="w-3.5 h-3.5 text-amber-400" />}>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((r) => {
                    const count = ratingDist[r] ?? 0;
                    const pct = rated.length ? (count / rated.length) * 100 : 0;
                    return (
                      <div key={r} className="flex items-center gap-3">
                        <span className="text-[12px] text-amber-400/70 w-4 tabular-nums">{r}★</span>
                        <div className="flex-1 h-6 rounded-lg overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.04)" }}>
                          {pct > 0 && (
                            <div className="h-full rounded-lg transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: "linear-gradient(90deg, rgba(245,158,11,0.5), rgba(245,158,11,0.3))",
                              }} />
                          )}
                        </div>
                        <span className="text-[12px] text-white/30 w-4 tabular-nums text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Top genres */}
            {topGenres.length > 0 && (
              <Section label="Favourite Genres" icon={<Award className="w-3.5 h-3.5 text-purple-400" />}>
                <div className="space-y-2">
                  {topGenres.map(([genre, count]) => (
                    <div key={genre} className="flex items-center gap-3">
                      <span className="text-[12px] text-white/40 w-28 truncate">{genre}</span>
                      <div className="flex-1 h-6 rounded-lg overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        {count > 0 && (
                          <div className="h-full rounded-lg transition-all duration-500"
                            style={{
                              width: `${(count / maxGenre) * 100}%`,
                              background: "linear-gradient(90deg, rgba(139,92,246,0.5), rgba(139,92,246,0.25))",
                            }} />
                        )}
                      </div>
                      <span className="text-[12px] text-white/30 w-4 tabular-nums text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const COLORS: Record<string, { bg: string; icon: string; glow: string }> = {
  amber:  { bg: "rgba(245,158,11,0.08)",  icon: "text-amber-400",  glow: "rgba(245,158,11,0.15)" },
  blue:   { bg: "rgba(96,165,250,0.08)",  icon: "text-blue-400",   glow: "rgba(96,165,250,0.15)" },
  purple: { bg: "rgba(167,139,250,0.08)", icon: "text-purple-400", glow: "rgba(167,139,250,0.15)" },
  green:  { bg: "rgba(52,211,153,0.08)",  icon: "text-emerald-400",glow: "rgba(52,211,153,0.15)" },
};

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
  const c = COLORS[color] ?? COLORS.amber;
  return (
    <div className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{ background: c.bg, border: `1px solid ${c.glow}` }}>
        <Icon className={`w-4 h-4 ${c.icon}`} />
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30 mt-1">{label}</p>
      {sub && <p className="text-[12px] text-white/20 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-[13px] font-semibold text-white/60">{label}</h2>
      </div>
      {children}
    </div>
  );
}
