import { createClient } from '@/lib/supabase/server';
import { Episode } from '@/lib/types'; // 参照先を修正

// すべてのエピソードを取得
export async function getEpisodes(): Promise<Episode[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('episodes')
    .select('*') // Referenceに合わせて全カラムを取得
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }

  return data as Episode[];
}

// ジャンルでエピソードをフィルタリング
export async function getEpisodesByGenre(genre: string): Promise<Episode[]> {
  const supabase = createClient();

  let query = supabase
    .from('episodes')
    .select('*') // Referenceに合わせて全カラムを取得
    .order('created_at', { ascending: false });

  if (genre && genre.toLowerCase() !== 'all') {
    query = query.eq('genre', genre);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching episodes by genre:', error);
    return [];
  }

  return data as Episode[];
}