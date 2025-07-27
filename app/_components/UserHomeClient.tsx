"use client";

// Client-side home wrapper to manage UI state.
import { useState, useEffect } from "react";
import EpisodeCard from "./EpisodeCard";
import { Episode } from "@/lib/types"; // 修正
import EpisodePlayer from "./EpisodePlayer";
import GenreFilter from "./GenreFilter";
import { db } from "@/lib/firebase/client"; // 追加
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"; // 追加

interface Props {
  initialEpisodes: Episode[];
}

export default function UserHomeClient({ initialEpisodes }: Props) {
  const [current, setCurrent] = useState<Episode | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [loading, setLoading] = useState(false);

  // fetch when genre changes
  useEffect(() => {
    const fetchEpisodesByGenre = async () => {
      if (!selectedGenre) {
        setEpisodes(initialEpisodes);
        return;
      }
      setLoading(true);
      try {
        const q = query(
          collection(db, "episodes"),
          where("genre", "==", selectedGenre),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const episodesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Episode[];
        setEpisodes(episodesData);
      } catch (error) {
        console.error("Genre fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodesByGenre();
  }, [selectedGenre, initialEpisodes]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Podcast Episodes</h1>
      <GenreFilter
          genres={[...new Set(initialEpisodes.map((e) => e.genre).filter((g): g is string => !!g))]}
          selected={selectedGenre}
          onSelect={(g) => setSelectedGenre(g)}
        />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} onSelect={setCurrent} />
          ))}
        </section>
      )}
      <EpisodePlayer episode={current} onClose={() => setCurrent(null)} />
    </main>
  );
}