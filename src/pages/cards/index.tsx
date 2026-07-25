import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { Search } from "lucide-react";
import { Layout } from "@/components/portfolio/Layout";
import { ErrorState, LoadingState, SetupState } from "@/components/portfolio/AsyncState";
import { cardSlug } from "@/lib/clash/cards";
import { mapCardList, mapSupportCardList } from "@/lib/clash/mappers";
import type { Card } from "@/lib/mock-data";
import { cardsAction, errorMessage, isConvexConfigured } from "@/lib/convex";

const RARITIES = ["All", "Common", "Rare", "Epic", "Legendary", "Champion"] as const;

export default function CardsPage() {
  if (!isConvexConfigured) {
    return (
      <Layout>
        <SetupState feature="the card library" />
      </Layout>
    );
  }
  return <CardLibrary />;
}

function CardLibrary() {
  const getCards = useAction(cardsAction);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>("All");
  const [showTowerTroops, setShowTowerTroops] = useState(false);

  const query = useQuery({
    queryKey: ["card-library"],
    queryFn: async () => {
      const payload = await getCards({});
      return {
        cards: mapCardList(payload.cards.data),
        towerTroops: mapSupportCardList(payload.cards.data)
      };
    },
    staleTime: 60 * 60 * 1000,
    retry: false
  });

  const source = showTowerTroops ? query.data?.towerTroops ?? [] : query.data?.cards ?? [];

  const filtered = useMemo(
    () =>
      source.filter((card) => {
        const matchesSearch = card.name.toLowerCase().includes(search.trim().toLowerCase());
        return matchesSearch && (rarity === "All" || card.rarity === rarity);
      }),
    [source, rarity, search]
  );

  const evolutions = useMemo(() => (query.data?.cards ?? []).filter((card) => card.canEvolve).length, [query.data]);

  if (query.isLoading) {
    return (
      <Layout>
        <LoadingState label="cards" />
      </Layout>
    );
  }
  if (query.error) {
    return (
      <Layout>
        <ErrorState message={errorMessage(query.error)} />
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Cards | Clash Crown</title>
        <meta name="description" content="Every Clash Royale card with elixir cost, rarity and Evolution availability." />
      </Head>
      <div className="decks-page">
        <section className="decks-hero">
          <span className="eyebrow">Live Clash Royale card catalog</span>
          <h1>Cards</h1>
          <p>
            {query.data?.cards.length ?? 0} cards · {evolutions} with Evolutions · {query.data?.towerTroops.length ?? 0} Tower
            Troops
          </p>
        </section>

        <section className="card-browser profile-section">
          <div className="browser-toolbar">
            <label className="card-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search cards"
                aria-label="Search cards"
              />
            </label>
            <label className="rarity-filter">
              <span className="sr-only">Filter rarity</span>
              <select value={rarity} onChange={(event) => setRarity(event.target.value as (typeof RARITIES)[number])}>
                {RARITIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <button type="button" className={showTowerTroops ? "pink-button" : ""} onClick={() => setShowTowerTroops((v) => !v)}>
              {showTowerTroops ? "Showing Tower Troops" : "Show Tower Troops"}
            </button>
          </div>

          <div className="card-library">
            {filtered.map((card) => (
              <CardTile key={card.id ?? card.name} card={card} />
            ))}
          </div>
          {!filtered.length ? <p className="empty-results">No cards match those filters.</p> : null}
        </section>
      </div>
    </Layout>
  );
}

function CardTile({ card }: { card: Card }) {
  return (
    <Link href={`/cards/${cardSlug(card.name)}`} className="card-tile">
      {card.canEvolve ? <span className="evo-flag">EVO</span> : null}
      <Image src={card.image} alt={card.name} width={76} height={94} />
      <strong>{card.name}</strong>
      <span>
        {card.rarity} · {card.elixir || "?"}
      </span>
    </Link>
  );
}
