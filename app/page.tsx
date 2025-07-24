import UserHomeClient from "./_components/UserHomeClient";
import { Episode } from "./_components/EpisodeCard";

// TODO: Replace with Supabase data in later phase
const mockEpisodes: Episode[] = [
  {
    id: "1",
    title: "First Episode",
    description: "This is a mock episode description.",
    published_at: "2025-01-01T00:00:00Z",
    thumbnail: "/placeholder.png",
    audio_url: "/audio/mock1.mp3",
  },
  {
    id: "2",
    title: "Second Episode",
    description: "Another mock episode.",
    published_at: "2025-02-01T00:00:00Z",
    thumbnail: "/placeholder.png",
    audio_url: "/audio/mock2.mp3",
  },
];

export default function HomePage() {
  return <UserHomeClient episodes={mockEpisodes} />;
}
