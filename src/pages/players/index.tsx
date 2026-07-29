import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "convex/react";
import { Layout } from "@/components/portfolio/Layout";
import { ProfileSearch } from "@/components/portfolio/ProfileSearch";
import { SetupState } from "@/components/portfolio/AsyncState";
import { EntityCell, TableShell, TrophyCell } from "@/components/portfolio/DataTable";
import { directorySizeQuery, isConvexConfigured, searchPlayersQuery } from "@/lib/convex";

/**
 * Player lookup by name.
 *
 * The official API has no player search, so this reads the directory the
 * pipeline builds from leaderboards, clan rosters, battle logs and profiles
 * people open. That makes coverage broad but not total, and the page says so
 * rather than implying a miss means the player does not exist.
 */
export default function PlayerSearchPage() {
  const router = useRouter();
  const term = typeof router.query.q === "string" ? router.query.q.trim() : "";

  if (!isConvexConfigured) {
    return (
      <Layout>
        <SetupState feature="player search" />
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{term ? `${term} | Player Search` : "Player Search"} | Clash Crown</title>
        <meta name="description" content="Find a Clash Royale player by name or by tag." />
      </Head>
      <div className="profile-page">
        <section className="decks-hero">
          <span className="eyebrow">Player lookup</span>
          <h1>Find a player</h1>
          <p>Search by name, or paste a player tag. Both land on the same profile.</p>
          <ProfileSearch />
        </section>
        <Results term={term} />
      </div>
    </Layout>
  );
}

function Results({ term }: { term: string }) {
  const results = useQuery(searchPlayersQuery, term ? { query: term, limit: 25 } : "skip");
  const directorySize = useQuery(directorySizeQuery, {});

  const known = directorySize ? `${directorySize.toLocaleString()} players` : "the directory";

  if (!term) {
    return (
      <section className="profile-section">
        <h2>Search by name</h2>
        <p className="empty-results">
          Type a player name above. Names come from {known} Clash Crown has seen on leaderboards, in clan rosters and in
          battle logs — a tag always works, and using one adds that player to the directory.
        </p>
      </section>
    );
  }

  if (results === undefined) {
    return (
      <section className="profile-section">
        <h2>Results</h2>
        <p className="empty-results">Searching…</p>
      </section>
    );
  }

  if (!results.players.length) {
    return (
      <section className="profile-section">
        <div className="section-heading">
          <h2>Results</h2>
        </div>
        {results.tag ? (
          <p className="table-note">
            No player named “{term}” is in the directory, but that string is a valid tag.{" "}
            <Link href={`/players/${results.tag}`}>Open #{results.tag}</Link>.
          </p>
        ) : (
          <p className="empty-results">
            No player called “{term}” is in the directory yet. Open them once by tag and their name becomes searchable
            for everyone.
          </p>
        )}
      </section>
    );
  }

  return (
    <TableShell
      title={`Players matching “${term}”`}
      head={["Player", "Clan", "Trophies", ""]}
      note={
        <>
          Searching {known}. Names are not unique in Clash Royale — the players seen most often are listed first.
          {results.tag ? (
            <>
              {" "}
              “{term}” is also a valid tag: <Link href={`/players/${results.tag}`}>open #{results.tag}</Link>.
            </>
          ) : null}
        </>
      }
    >
      {results.players.map((hit) => (
        <tr key={hit.tag}>
          <td>
            <EntityCell href={`/players/${hit.tag}`} name={hit.name} sub={`#${hit.tag}`} />
          </td>
          <td>
            {hit.clanName ? (
              hit.clanTag ? (
                <Link href={`/clans/${hit.clanTag}`}>{hit.clanName}</Link>
              ) : (
                hit.clanName
              )
            ) : (
              "—"
            )}
          </td>
          <td>{hit.trophies ? <TrophyCell value={hit.trophies} /> : "—"}</td>
          <td>
            <Link href={`/players/${hit.tag}`} className="pink-button">
              Open
            </Link>
          </td>
        </tr>
      ))}
    </TableShell>
  );
}
