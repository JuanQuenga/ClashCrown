import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/portfolio/Layout";
import { ChestList, PlayerHero, PlayerStats, PlayerTabs, ProgressionChart } from "@/components/portfolio/PlayerSections";
import { getPlayer, player as mockPlayer } from "@/lib/mock-data";

export default function PlayerPage() {
  const { data: player } = useQuery({
    queryKey: ["player", "CCDEMO"],
    queryFn: getPlayer,
    initialData: mockPlayer
  });

  if (!player) return null;

  return (
    <Layout>
      <Head>
        <title>{`${player.name} | Clash Crown`}</title>
      </Head>
      <div className="profile-page">
        <PlayerHero player={player} />
        <PlayerTabs />
        <PlayerStats player={player} />
        <ProgressionChart />
        <ChestList chests={player.chests} />
      </div>
    </Layout>
  );
}
