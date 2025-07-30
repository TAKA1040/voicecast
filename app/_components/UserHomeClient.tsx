"use client";

// Client-side home wrapper to manage UI state.
// TODO: Replace mockEpisodes with server-provided data via props.
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import EpisodeCard, { Episode } from "./EpisodeCard";
import EpisodePlayer from "./EpisodePlayer";
import GenreFilter from "./GenreFilter";

interface Props {
  initialEpisodes: Episode[];
}

export default function UserHomeClient({ initialEpisodes }: Props) {
  const [current, setCurrent] = useState<Episode | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);

  // fetch when genre changes
  useEffect(() => {
    if (!selectedGenre) {
      setEpisodes(initialEpisodes);
      return;
    }
    const supabase = createClient();
    supabase
      .from("episodes")
      .select(`*`)
      .eq("genre", selectedGenre)
      .order("published_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Genre fetch error", error);
        } else if (data) {
          if (data) {
            setEpisodes(data);
          }
        }
      });
  }, [selectedGenre, initialEpisodes]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Podcast Episodes</h1>
      <GenreFilter
          genres={[...new Set(initialEpisodes.map((e) => e.genre).filter((g): g is string => !!g))]}
          selected={selectedGenre}
          onSelect={(g) => setSelectedGenre(g)}
        />
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {episodes.map((ep) => (
          <EpisodeCard key={ep.id} episode={ep} onSelect={setCurrent} />
        ))}
      </section>
      <EpisodePlayer episode={current} onClose={() => setCurrent(null)} />
    </main>
  );
}
