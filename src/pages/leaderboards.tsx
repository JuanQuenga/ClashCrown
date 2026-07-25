import Head from "next/head";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { Layout } from "@/components/portfolio/Layout";
import { ErrorState, LoadingState, SetupState } from "@/components/portfolio/AsyncState";
import { EntityCell, RankCell, TableShell, TrophyCell } from "@/components/portfolio/DataTable";
import { badgeImage } from "@/lib/clash/assets";
import type { ApiClanRanking, ApiLocation, ApiPlayerRanking, RankingKind } from "@/lib/clash/types";
import {
  GLOBAL_LOCATION_ID,
  errorMessage,
  isConvexConfigured,
  locationsAction,
  rankingsAction
} from "@/lib/convex";

const TABS: Array<{ kind: RankingKind; label: string; blurb: string }> = [
  { kind: "players", label: "Top Players", blurb: "Highest trophy counts on the ladder." },
  { kind: "clans", label: "Top Clans", blurb: "Clans ranked by total clan score." },
  { kind: "clanwars", label: "Clan Wars", blurb: "Clans ranked by war trophies." }
];

export default function LeaderboardsPage() {
  if (!isConvexConfigured) {
    return (
      <Layout>
        <SetupState feature="leaderboards" />
      </Layout>
    );
  }
  return <Leaderboards />;
}

function Leaderboards() {
  const [kind, setKind] = useState<RankingKind>("players");
  const [locationId, setLocationId] = useState(GLOBAL_LOCATION_ID);

  const getLocations = useAction(locationsAction);
  const getRankings = useAction(rankingsAction);

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await getLocations({})).locations.data.items ?? [],
    staleTime: 24 * 60 * 60 * 1000,
    retry: false
  });

  const rankingsQuery = useQuery({
    queryKey: ["rankings", kind, locationId],
    queryFn: async () => (await getRankings({ kind, locationId, limit: 100 })).rankings.data.items ?? [],
    placeholderData: (previous) => previous,
    retry: false
  });

  // The API exposes the global pseudo-location in /locations; prefer whatever it
  // actually returns over our hardcoded fallback id.
  const { global, countries } = useMemo(() => splitLocations(locationsQuery.data ?? []), [locationsQuery.data]);
  const activeTab = TABS.find((tab) => tab.kind === kind) ?? TABS[0];

  return (
    <Layout>
      <Head>
        <title>Leaderboards | Clash Crown</title>
        <meta name="description" content="Global and per-country Clash Royale rankings for players and clans." />
      </Head>
      <div className="profile-page">
        <section className="decks-hero">
          <span className="eyebrow">Live Clash Royale rankings</span>
          <h1>Leaderboards</h1>
          <p>{activeTab.blurb}</p>
        </section>

        <div className="archetype-tabs" aria-label="Leaderboard type">
          {TABS.map((tab) => (
            <button key={tab.kind} type="button" className={kind === tab.kind ? "active" : ""} onClick={() => setKind(tab.kind)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="browser-toolbar">
          <label className="rarity-filter">
            <span className="sr-only">Region</span>
            <select value={locationId} onChange={(event) => setLocationId(Number(event.target.value))}>
              {global.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
              {countries.length ? (
                <optgroup label="Countries">
                  {countries.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </label>
        </div>

        {rankingsQuery.isLoading ? <LoadingState label="rankings" /> : null}
        {rankingsQuery.error ? <ErrorState message={errorMessage(rankingsQuery.error)} /> : null}
        {rankingsQuery.data ? (
          kind === "players" ? (
            <PlayerRankings rows={rankingsQuery.data as ApiPlayerRanking[]} />
          ) : (
            <ClanRankings rows={rankingsQuery.data as ApiClanRanking[]} kind={kind} />
          )
        ) : null}
      </div>
    </Layout>
  );
}

function splitLocations(locations: ApiLocation[]) {
  const global = locations.filter((location) => !location.isCountry);
  const countries = locations.filter((location) => location.isCountry).sort((a, b) => a.name.localeCompare(b.name));
  return {
    global: global.length ? global : [{ id: GLOBAL_LOCATION_ID, name: "Global" }],
    countries
  };
}

function PlayerRankings({ rows }: { rows: ApiPlayerRanking[] }) {
  return (
    <TableShell
      title="Top Players"
      head={["Rank", "Player", "Level", "Trophies", "Clan"]}
      empty={!rows.length}
      note={`Showing ${rows.length} ranked players.`}
    >
      {rows.map((row) => (
        <tr key={row.tag}>
          <td>
            <RankCell rank={row.rank} previousRank={row.previousRank} />
          </td>
          <td>
            <EntityCell href={`/players/${row.tag.replace(/^#/, "")}`} name={row.name} sub={row.tag} />
          </td>
          <td>
            <span className="table-level">{row.expLevel ?? "—"}</span>
          </td>
          <td>
            <TrophyCell value={row.trophies} />
          </td>
          <td>
            {row.clan?.tag ? (
              <EntityCell
                href={`/clans/${row.clan.tag.replace(/^#/, "")}`}
                name={row.clan.name ?? "Clan"}
                badge={badgeImage(row.clan.badgeId, row.clan.badgeUrls)}
              />
            ) : (
              "—"
            )}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function ClanRankings({ rows, kind }: { rows: ApiClanRanking[]; kind: RankingKind }) {
  const warMode = kind === "clanwars";
  return (
    <TableShell
      title={warMode ? "Clan War Rankings" : "Top Clans"}
      head={["Rank", "Clan", "Members", warMode ? "War Trophies" : "Clan Score"]}
      empty={!rows.length}
      note={`Showing ${rows.length} ranked clans.`}
    >
      {rows.map((row) => (
        <tr key={row.tag}>
          <td>
            <RankCell rank={row.rank} previousRank={row.previousRank} />
          </td>
          <td>
            <EntityCell
              href={`/clans/${row.tag.replace(/^#/, "")}`}
              name={row.name}
              badge={badgeImage(row.badgeId, row.badgeUrls)}
              sub={row.location?.name}
            />
          </td>
          <td>{row.members ?? "—"} / 50</td>
          <td>
            <TrophyCell value={warMode ? row.clanWarTrophies : row.clanScore} />
          </td>
        </tr>
      ))}
    </TableShell>
  );
}
