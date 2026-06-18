import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { ClanChart, ClanChestProgress, ClanProfile, MemberTable } from "@/components/portfolio/ClanSections";
import { Layout } from "@/components/portfolio/Layout";
import { clan as mockClan, getClan } from "@/lib/mock-data";

export default function ClanPage() {
  const { data: clan } = useQuery({
    queryKey: ["clan", "CCDEMO"],
    queryFn: getClan,
    initialData: mockClan
  });

  if (!clan) return null;

  return (
    <Layout>
      <Head>
        <title>{`${clan.name} | Clash Crown`}</title>
      </Head>
      <div className="profile-page clan-page">
        <ClanProfile clan={clan} />
        <ClanChestProgress />
        <ClanChart />
        <MemberTable clan={clan} />
      </div>
    </Layout>
  );
}
