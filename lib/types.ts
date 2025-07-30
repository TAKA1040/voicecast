export interface Episode {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  genre: string | null;
  audio_url: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  published_at: string;
}
