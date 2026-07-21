import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "@/i18n/LocalizedLink";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

interface Episode {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  html_embed: string;
  cover_image: string | null;
  episode_number: number | null;
  duration: string | null;
  guest_name: string | null;
  published_at: string;
}

const PodcastEpisode = () => {
  const { slug } = useParams<{ slug: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("podcasts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setEpisode(data as Episode);
      setLoading(false);
      if (data) document.title = `${data.title} — Podcast`;
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ink))] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4f46e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))]">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4f46e5] mb-4">404</p>
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-6" style={editorial}>
            Epizod topilmadi
          </h1>
          <Link to="/podcast" className="text-sm text-zinc-400 hover:text-[#4f46e5] uppercase tracking-widest">
            ← Podcastga qaytish
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))]">
      <Header />

      <article className="px-6 md:px-8 pt-12 md:pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/podcast"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-[#4f46e5] transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Barcha epizodlar
          </Link>

          <p className="text-[#4f46e5] font-bold uppercase tracking-[0.4em] text-[10px] mb-5">
            Episode {String(episode.episode_number ?? "").padStart(2, "0")} — On Air
          </p>

          <h1
            className="text-[clamp(2rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tighter uppercase text-[hsl(var(--paper))] mb-8"
            style={editorial}
          >
            {episode.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pb-8 mb-10 border-b border-[hsl(var(--rule))]">
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(episode.published_at).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            {episode.duration && (
              <span className="inline-flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {episode.duration}
              </span>
            )}
            {episode.guest_name && (
              <span className="inline-flex items-center gap-2 text-[#4f46e5]">
                <User className="w-3.5 h-3.5" /> {episode.guest_name}
              </span>
            )}
          </div>

          {episode.description && (
            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light mb-12">
              {episode.description}
            </p>
          )}

          <div className="border border-[hsl(var(--rule))] bg-zinc-950/50 p-4 md:p-6 mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">▶ Play</p>
            <div
              className="podcast-embed"
              dangerouslySetInnerHTML={{ __html: episode.html_embed }}
            />
          </div>

          <div className="border-t border-[hsl(var(--rule))] pt-8 text-center">
            <p className="text-zinc-600 text-sm tracking-widest uppercase">— Fin —</p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default PodcastEpisode;
