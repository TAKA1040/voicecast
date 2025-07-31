'use client'

import { useState } from 'react'

interface GenreFilterProps {
  genres: string[];
  onGenreChange: (genreId: string) => void;
}

export default function GenreFilter({ genres, onGenreChange }: GenreFilterProps) {
  const [selectedGenre, setSelectedGenre] = useState('all');

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
    onGenreChange(genre);
  };

  return (
    <section className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
      <div className="mb-4 md:mb-5">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">
          🎯 ジャンルから探す
        </h3>
      </div>
      
      <div className="relative">
        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="w-full px-4 py-3 pr-8 text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="ジャンルを選択"
        >
          <option value="all">すべて</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </section>
  )
}
