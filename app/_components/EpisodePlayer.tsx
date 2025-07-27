"use client";

// EpisodePlayer Component (modal)
import { Episode } from "@/lib/types";
import { useEffect } from "react";

interface Props {
  episode: Episode | null;
  onClose: () => void;
}

export default function EpisodePlayer({ episode, onClose }: Props) {
  // Close on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!episode) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <button
          aria-label="Close"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{episode.title}</h2>
        {/* Audio element placeholder */}
        <audio controls className="w-full" src={episode.audio_url}>
          Your browser does not support the audio element.
        </audio>
        <p className="mt-4 text-sm text-gray-600">{episode.description}</p>
      </div>
    </div>
  );
}