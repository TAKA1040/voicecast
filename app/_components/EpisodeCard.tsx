"use client";

// EpisodeCard Component
// TODO: Replace mock structure with actual design once API is integrated.
import Image from "next/image";
import { Episode } from "@/lib/types";

interface Props {
  episode: Episode;
  onSelect: (ep: Episode) => void;
}

export default function EpisodeCard({ episode, onSelect }: Props) {
  return (
    <button
      className="episode-card w-full text-left bg-white rounded shadow p-4 hover:shadow-lg transition-transform"
      onClick={() => onSelect(episode)}
      type="button"
    >
      {/* Thumbnail */}
      {episode.thumbnail && (
        <Image
          src={episode.thumbnail}
          alt={episode.title}
          width={320}
          height={180}
          className="mb-2 rounded"
        />
      )}
      <h2 className="text-lg font-semibold mb-1 line-clamp-2">
        {episode.title}
      </h2>
      <p className="text-sm text-gray-600 line-clamp-3">
        {episode.description}
      </p>
      <span className="block mt-2 text-xs text-gray-400">
        {new Date(episode.published_at).toLocaleDateString()}
      </span>
    </button>
  );
}

// NOTE: A simple Episode type is co-located for now until Supabase types are ready.
// This will be moved to a shared types file in a later refactor.
export type { Episode };
