"use client";

// Client-side home wrapper to manage UI state.
// TODO: Replace mockEpisodes with server-provided data via props.
import { useState } from "react";
import EpisodeCard, { Episode } from "./EpisodeCard";
import EpisodePlayer from "./EpisodePlayer";
import GenreFilter from "./GenreFilter";

interface Props {
  episodes: Episode[];
}

export default function UserHomeClient({ episodes }: Props) {
  const [current, setCurrent] = useState<Episode | null>(null);
  // TODO: genre filter state when implemented

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Podcast Episodes</h1>
      <GenreFilter genres={[]} selected={null} onSelect={() => {}} />
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {episodes.map((ep) => (
          <EpisodeCard key={ep.id} episode={ep} onSelect={setCurrent} />
        ))}
      </section>
      <EpisodePlayer episode={current} onClose={() => setCurrent(null)} />
    </main>
  );
}
