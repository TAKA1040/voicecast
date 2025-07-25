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
      published_at as \"publishedAt\",
      audio_url as \"audioUrl\"
    `)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }

  return data as Episode[];
}
