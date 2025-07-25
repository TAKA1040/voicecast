import UserHomeClient from "./_components/UserHomeClient";
import { getEpisodes } from '@/lib/supabase/episodes';

// TODO: Replace with Supabase data in later phase
export default async function HomePage() {
  const episodes = await getEpisodes();

  return (
    <main className="container mx-auto p-4">
      <UserHomeClient initialEpisodes={episodes} />
    </main>
  );
}
