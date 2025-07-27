import { Timestamp } from 'firebase/firestore';

export interface Episode {
  id: string; // Firestore document ID
  title: string;
  description: string | null;
  genre: string | null;
  audio_url: string;
  createdAt: Timestamp; // Firestore Timestamp
  user_id: string | null;
}
