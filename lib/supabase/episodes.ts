import { createClient } from '@/lib/supabase/server';
import { Episode } from '@/app/_components/EpisodeCard';

export async function getEpisodes() {
  const supabase = createClient();
  
  // Fetch public episodes without authentication
  const { data, error } = await supabase
    .from('episodes')
    .select(`
      id,
      title,
      description,
      thumbnail,
      duration,
      published_at as "publishedAt",
      audio_url as "audioUrl"
    `)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }

  return data as Episode[];
}

// Fetch episodes filtered by genre. If genre is 'All' or empty, returns all episodes.
export async function getEpisodesByGenre(genre: string) {
  const supabase = createClient();

  let query = supabase.from('episodes').select(`
    id,
    title,
    description,
    thumbnail,
    duration,
    published_at as "publishedAt",
    audio_url as "audioUrl",
    genre
  `).order('published_at', { ascending: false });

  if (genre && genre !== 'All') {
    query = query.eq('genre', genre);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching episodes by genre:', error);
    return [];
  }

  return data as Episode[];
}
