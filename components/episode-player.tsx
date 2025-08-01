'use client'

import { useState, useEffect, useRef } from 'react'
import { Episode } from '@/lib/types'

interface EpisodePlayerProps {
  episode: Episode | null
}

const genreMap: Record<string, { name: string; emoji: string }> = {
  tech: { name: 'テクノロジー', emoji: '💻' },
  business: { name: 'ビジネス', emoji: '💼' },
  lifestyle: { name: 'ライフスタイル', emoji: '🌱' },
  entertainment: { name: 'エンタメ', emoji: '🎭' },
  education: { name: '教育', emoji: '📚' },
  news: { name: 'ニュース', emoji: '📰' },
  health: { name: '健康', emoji: '💪' },
}

export default function EpisodePlayer({ episode }: EpisodePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (episode && audioRef.current) {
      audioRef.current.src = episode.audio_url;
      // Don't autoplay - wait for user interaction
      setIsPlaying(false);
    }
  }, [episode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const setAudioDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  if (!episode) {
    return (
      <section className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 mb-10 shadow-2xl text-center sticky top-5">
        <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 md:px-6 py-2 rounded-full text-sm font-semibold mb-6">
          ✨ VoiceCast Player
        </div>
        <p className="text-gray-600">再生するエピソードを選択してください。</p>
      </section>
    );
  }

  const getGenreInfo = (genre: string | null) => {
    if (!genre || !genreMap[genre]) {
      return { name: 'その他', emoji: '🎧' }
    }
    return genreMap[genre]
  }
  const genreInfo = getGenreInfo(episode.genre);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <section className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 mb-10 shadow-2xl text-center sticky top-5">
      <audio ref={audioRef} />
      <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 md:px-6 py-2 rounded-full text-sm font-semibold mb-6">
        ✨ 現在再生中
      </div>

      <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6 md:mb-8 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center text-4xl md:text-6xl text-white shadow-2xl">
        {genreInfo.emoji}
      </div>

      <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 leading-tight px-4">
        {episode.title}
      </h2>
      
      <p className="text-lg md:text-xl text-gray-600 mb-6">
        配信者: {episode.user_id || '不明'}
      </p>

      <div className="flex justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-300 bg-white text-gray-600 text-lg md:text-xl hover:border-pink-400 hover:text-pink-400 transition-all duration-300 hover:scale-110" aria-label="前のエピソード">⏮</button>
        <button onClick={togglePlayPause} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl md:text-2xl shadow-xl hover:scale-110 transition-all duration-300" aria-label={isPlaying ? '一時停止' : '再生'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-300 bg-white text-gray-600 text-lg md:text-xl hover:border-pink-400 hover:text-pink-400 transition-all duration-300 hover:scale-110" aria-label="次のエピソード">⏭</button>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div onClick={handleProgressClick} className="h-2 bg-gray-200 rounded-full cursor-pointer" role="slider" aria-label="再生位置" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </section>
  )
}
