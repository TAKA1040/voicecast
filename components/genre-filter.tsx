'use client'

import { useState } from 'react'

const genres = [
  { id: 'all', name: 'すべて', emoji: '🌟' },
  { id: 'tech', name: 'テクノロジー', emoji: '💻' },
  { id: 'business', name: 'ビジネス', emoji: '💼' },
  { id: 'lifestyle', name: 'ライフスタイル', emoji: '🌱' },
  { id: 'entertainment', name: 'エンタメ', emoji: '🎭' },
  { id: 'education', name: '教育', emoji: '📚' },
  { id: 'news', name: 'ニュース', emoji: '📰' },
  { id: 'health', name: '健康', emoji: '💪' },
]

interface GenreFilterProps {
  onGenreChange: (genreId: string) => void;
}

export default function GenreFilter({ onGenreChange }: GenreFilterProps) {
  const [activeGenre, setActiveGenre] = useState('all');

  const handleGenreClick = (genreId: string) => {
    setActiveGenre(genreId);
    onGenreChange(genreId); // 親コンポーネントに選択されたジャンルを通知
  };

  return (
    <section className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
      <div className="mb-4 md:mb-5">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">
          🎯 ジャンルから探す
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className={`
              px-3 py-2 md:px-6 md:py-3 rounded-full font-medium transition-all duration-300 
              border-2 flex items-center gap-2 hover:scale-105 hover:shadow-lg
              text-xs md:text-sm
              ${
                activeGenre === genre.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
              }
            `}
            aria-pressed={activeGenre === genre.id}
            aria-label={`${genre.name}ジャンルを選択`}
          >
            <span className="text-sm md:text-lg">{genre.emoji}</span>
            <span>{genre.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
