import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Activity, MapPin, Timer, TrendingUp, Heart, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface StravaSummary {
  firstname: string; lastname: string; profile_url: string;
  city: string; country: string;
  recent_run_count: number; recent_run_distance: number; recent_run_moving_time: number;
  ytd_run_count: number; ytd_run_distance: number; ytd_run_moving_time: number;
  all_run_count: number; all_run_distance: number;
  last_synced_at: string;
}
interface StravaActivity {
  id: number; name: string; type: string; distance: number; moving_time: number;
  total_elevation_gain: number; average_heartrate: number | null;
  average_speed: number | null; start_date_local: string; kudos_count: number;
}

const fmtKm = (m: number) => (m / 1000).toFixed(1);
const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}s ${m}d` : `${m}d`;
};
const fmtPace = (speed: number | null) => {
  if (!speed || speed === 0) return "—";
  const paceSec = 1000 / speed;
  const m = Math.floor(paceSec / 60), s = Math.floor(paceSec % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
};

const Fitness = () => {
  const [summary, setSummary] = useState<StravaSummary | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, a] = await Promise.all([
        supabase.from("strava_summary").select("*").maybeSingle(),
        supabase.from("strava_activities").select("*").order("start_date", { ascending: false }).limit(50),
      ]);
      setSummary(s.data as any);
      setActivities((a.data || []) as any);
      setLoading(false);
    };
    load();
  }, []);

  // Weekly aggregation for chart (last 12 weeks)
  const weeklyData = (() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      const wk = `${d.getMonth() + 1}/${d.getDate()}`;
      map.set(wk, 0);
    }
    activities.forEach(a => {
      if (a.type !== "Run") return;
      const d = new Date(a.start_date_local);
      const diff = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 3600 * 1000));
      if (diff < 0 || diff >= 12) return;
      const target = new Date(now); target.setDate(target.getDate() - diff * 7);
      const wk = `${target.getMonth() + 1}/${target.getDate()}`;
      map.set(wk, (map.get(wk) || 0) + a.distance / 1000);
    });
    return Array.from(map.entries()).map(([week, km]) => ({ week, km: Number(km.toFixed(1)) }));
  })();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium mb-4">
            <Activity className="w-4 h-4" /> Strava bilan jonli sinxron
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Mening fitness yo'lim</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Marketing — bu marafon. Har kuni o'zimni jismonan ham, miyamni ham trening qilaman.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Yuklanmoqda...</div>
        ) : !summary ? (
          <div className="text-center py-20 text-muted-foreground">Ma'lumot topilmadi</div>
        ) : (
          <>
            {/* Athlete card */}
            <Card className="p-6 mb-8 flex items-center gap-5 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20">
              {summary.profile_url && (
                <img src={summary.profile_url} alt={summary.firstname} className="w-20 h-20 rounded-full border-2 border-orange-500/30" />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{summary.firstname} {summary.lastname}</h2>
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                  <MapPin className="w-4 h-4" /> {summary.city}, {summary.country}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Oxirgi yangilanish: {new Date(summary.last_synced_at).toLocaleString("uz-UZ")}
                </p>
              </div>
              <a href="https://www.strava.com/athletes/172531720" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
                Strava'da kuzating
              </a>
            </Card>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard icon={<Zap />} label="Oxirgi 4 hafta" value={`${fmtKm(summary.recent_run_distance)} km`} sub={`${summary.recent_run_count} ta yugurish`} accent />
              <StatCard icon={<TrendingUp />} label="Yil boshidan" value={`${fmtKm(summary.ytd_run_distance)} km`} sub={`${summary.ytd_run_count} ta yugurish`} />
              <StatCard icon={<Timer />} label="Oxirgi oydagi vaqt" value={fmtTime(summary.recent_run_moving_time)} sub="harakat vaqti" />
              <StatCard icon={<Activity />} label="Jami yugurish" value={`${fmtKm(summary.all_run_distance)} km`} sub={`${summary.all_run_count} marta`} />
            </div>

            {/* Weekly chart */}
            <Card className="p-6 mb-10">
              <h3 className="text-lg font-semibold mb-1">Oxirgi 12 hafta — yugurish (km)</h3>
              <p className="text-xs text-muted-foreground mb-4">Har hafta uchun jami masofa</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(v: any) => [`${v} km`, "Masofa"]}
                    />
                    <Bar dataKey="km" fill="#fc4c02" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent activities list */}
            <h3 className="text-2xl font-bold mb-4">So'nggi faolliklar</h3>
            <div className="space-y-3">
              {activities.slice(0, 20).map(a => (
                <Card key={a.id} className="p-4 flex items-center gap-4 hover:border-orange-500/40 transition">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    a.type === "Run" ? "bg-orange-500/10 text-orange-500" :
                    a.type === "Walk" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                  }`}>
                    {a.type === "Run" ? "🏃" : a.type === "Walk" ? "🚶" : "🥾"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{a.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.start_date_local).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-sm">
                    <Metric label="Masofa" value={`${fmtKm(a.distance)} km`} />
                    <Metric label="Vaqt" value={fmtTime(a.moving_time)} />
                    {a.type === "Run" && <Metric label="Tempo" value={fmtPace(a.average_speed)} />}
                    {a.average_heartrate && <Metric label="HR" value={`${Math.round(a.average_heartrate)} bpm`} icon={<Heart className="w-3 h-3" />} />}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, accent }: any) => (
  <Card className={`p-5 ${accent ? "bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30" : ""}`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"}`}>
      {icon}
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
    {sub && <div className="text-xs text-muted-foreground/70 mt-0.5">{sub}</div>}
  </Card>
);

const Metric = ({ label, value, icon }: any) => (
  <div className="text-right">
    <div className="font-semibold flex items-center gap-1 justify-end">{icon}{value}</div>
    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
  </div>
);

export default Fitness;
