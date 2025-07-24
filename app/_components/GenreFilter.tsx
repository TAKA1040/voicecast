"use client";

// GenreFilter Component
// TODO: Wire up onChange handler to update parent search params.
import { useState } from "react";

interface Props {
  genres?: string[]; // list of available genres
  selected?: string | null;
  onSelect: (genre: string | null) => void;
}

export default function GenreFilter({ genres = [], selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const allGenres = ["All", ...genres];

  return (
    <div className="relative inline-block mb-4">
      <button
        type="button"
        className="px-3 py-1 border rounded text-sm"
        onClick={() => setOpen((o) => !o)}
      >
        {selected ?? "Genre"} ▼
      </button>
      {open && (
        <ul className="absolute z-10 bg-white border rounded mt-1 w-40 max-h-60 overflow-auto shadow">
          {allGenres.map((g) => (
            <li
              key={g}
              className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${
                selected === g ? "genre-badge-active" : ""
              }`}
              onClick={() => {
                onSelect(g === "All" ? null : g);
                setOpen(false);
              }}
            >
              {g}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
