import { sql } from "@/lib/db";
import { Book } from "@/lib/types";
import { BarChart2, Star, BookOpen, Clock, TrendingUp, Award } from "lucide-react";

async function getBooks(): Promise<Book[]> {
  try {
    const rows = await sql`SELECT * FROM books ORDER BY date_added DESC`;
    return rows as unknown as Book[];
  } catch {
    return [];
  }
}

function StatCard({ label, value, sub, icon: Icon, accent = "amber" }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  const colors: Record<string, string> = {
    amber: "text-amber-400 bg-amber-400/10",
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  };
  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 flex gap-4 items-start">
      <div className={`p-2.5 rounded-lg ${colors[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-[#8b8685] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-[#e6e1d3] mt-0.5">{value}</p>
        {sub && <p className="text-xs text-[#8b8685] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default async function StatsPage() {
  const books = await getBooks();
  const read = books.filter((b) => b.shelf === "read");
  const rated = read.filter((b) => b.rating && b.rating > 0);
  const avgRating = rated.length > 0 ? (rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1) : "—";
  const totalPages = read.reduce((s, b) => s + (b.page_count ?? 0), 0);

  // Books per year
  const byYear: Record<string, number> = {};
  for (const b of read) {
    const year = b.date_read?.slice(0, 4) ?? b.date_added?.slice(0, 4) ?? "Unknown";
    byYear[year] = (byYear[year] ?? 0) + 1;
  }
  const sortedYears = Object.entries(byYear).sort(([a], [b]) => b.localeCompare(a));
  const maxYear = Math.max(...Object.values(byYear), 1);

  // Top genres
  const genreCounts: Record<string, number> = {};
  for (const b of books) {
    for (const g of b.genres ?? []) {
      const clean = g.split("/")[0].trim();
      genreCounts[clean] = (genreCounts[clean] ?? 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCounts).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxGenre = Math.max(...topGenres.map(([, c]) => c), 1);

  // Rating distribution
  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const b of rated) if (b.rating) ratingDist[b.rating]++;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#e6e1d3]">Reading Stats</h1>
        <p className="text-[#8b8685] mt-1">Your reading journey at a glance.</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20">
          <BarChart2 className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-[#8b8685]">No data yet. Add some books to see your stats.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Books Read" value={read.length} icon={BookOpen} sub="total" />
            <StatCard label="Avg Rating" value={avgRating} icon={Star} accent="amber" sub={`across ${rated.length} rated`} />
            <StatCard label="Pages Read" value={totalPages.toLocaleString()} icon={TrendingUp} accent="green" />
            <StatCard label="Want to Read" value={books.filter(b => b.shelf === "want_to_read").length} icon={Clock} accent="blue" sub="on your list" />
          </div>

          {/* Books per year */}
          {sortedYears.length > 0 && (
            <section className="bg-[#161b22] border border-white/5 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#e6e1d3] mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Books Read Per Year
              </h2>
              <div className="space-y-3">
                {sortedYears.map(([year, count]) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-sm text-[#8b8685] w-12 text-right shrink-0">{year}</span>
                    <div className="flex-1 h-7 bg-white/5 rounded-md overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-md flex items-center px-2 transition-all duration-700"
                        style={{ width: `${Math.max(4, (count / maxYear) * 100)}%` }}
                      >
                        <span className="text-xs font-semibold text-[#0d1117]">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rating distribution */}
            {rated.length > 0 && (
              <section className="bg-[#161b22] border border-white/5 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[#e6e1d3] mb-6 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Rating Distribution
                </h2>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((r) => {
                    const count = ratingDist[r] ?? 0;
                    const pct = rated.length ? (count / rated.length) * 100 : 0;
                    return (
                      <div key={r} className="flex items-center gap-3">
                        <span className="text-xs text-amber-400 w-3">{r}★</span>
                        <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                          <div
                            className="h-full bg-amber-400/60 rounded transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#8b8685] w-5 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top genres */}
            {topGenres.length > 0 && (
              <section className="bg-[#161b22] border border-white/5 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[#e6e1d3] mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" /> Favourite Genres
                </h2>
                <div className="space-y-2">
                  {topGenres.map(([genre, count]) => (
                    <div key={genre} className="flex items-center gap-3">
                      <span className="text-xs text-[#8b8685] w-28 truncate">{genre}</span>
                      <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                        <div
                          className="h-full bg-purple-400/50 rounded transition-all duration-500"
                          style={{ width: `${(count / maxGenre) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#8b8685] w-5 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
