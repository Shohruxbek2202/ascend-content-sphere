import { useEffect, useState } from "react";
import { Link } from "@/i18n/LocalizedLink";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PublicPageHero } from "@/components/PublicPageHero";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Mic, Clock } from "lucide-react";

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

interface Episode {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  episode_number: number | null;
  duration: string | null;
  guest_name: string | null;
  published_at: string;
}

const Podcast = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Podcast — Shohruxbek Foziljonov";
    (async () => {
      const { data } = await supabase
        .from("podcasts")
        .select("id,slug,title,description,cover_image,episode_number,duration,guest_name,published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      setEpisodes((data || []) as Episode[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))]">
      <Header />
      <PublicPageHero
        eyebrow="On Air — Audio Field Notes"
        title={<>The<br />Podcast</>}
        lede="Ovoz shaklidagi marketing kundaligim. Strategiya, kampaniyalar va odamlar bilan ochiq suhbatlar."
        meta={`${episodes.length.toString().padStart(2, "0")} EPIZOD`}
      />

      <section className="px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="text-zinc-500 text-sm tracking-widest uppercase">Yuklanmoqda…</div>
          ) : episodes.length === 0 ? (
            <div className="border border-[hsl(var(--rule))] p-12 md:p-20 text-center">
              <Mic className="w-10 h-10 mx-auto text-[#4f46e5] mb-6" />
              <p className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-[hsl(var(--paper))]" style={editorial}>
                Efirga tayyorlanmoqda
              </p>
              <p className="text-zinc-500 mt-4 max-w-md mx-auto">
                Birinchi epizod tez orada. Obuna bo'ling — pochtangizga xabar beraman.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {episodes.map((ep, i) => (
                <Link
                  key={ep.id}
                  to={`/podcast/${ep.slug}`}
                  className="group border border-[hsl(var(--rule))] hover:border-[#4f46e5] transition-colors flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                    {ep.cover_image ? (
                      <img
                        src={ep.cover_image}
                        alt={ep.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[hsl(var(--ink))]/80 backdrop-blur px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#4f46e5] border border-[#4f46e5]/30">
                      EP {String(ep.episode_number ?? i + 1).padStart(2, "0")}
                    </div>
                    {ep.duration && (
                      <div className="absolute bottom-4 right-4 bg-[hsl(var(--ink))]/80 backdrop-blur px-3 py-1.5 text-[10px] font-bold tracking-widest text-zinc-300 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {ep.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-7 flex-1 flex flex-col">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3">
                      {new Date(ep.published_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                      {ep.guest_name && <> · Mehmon: {ep.guest_name}</>}
                    </p>
                    <h2
                      className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-[hsl(var(--paper))] group-hover:text-[#4f46e5] transition-colors mb-3"
                      style={editorial}
                    >
                      {ep.title}
                    </h2>
                    {ep.description && (
                      <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 flex-1">{ep.description}</p>
                    )}
                    <div className="mt-6 pt-5 border-t border-[hsl(var(--rule))] flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Eshitish</span>
                      <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-[#4f46e5] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Podcast;
