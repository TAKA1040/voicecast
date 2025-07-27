import { Timestamp } from 'firebase/firestore';

export interface Episode {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  user_id: string | null;
  createdAt: Timestamp;
  // UserHomeClientで使われるプロパティ
  thumbnail?: string;
  duration?: number;
  genre?: string;
}