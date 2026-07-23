import Head from "next/head";
import Image from "next/image";
import { Check, Copy, LoaderCircle, RefreshCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { Layout } from "@/components/portfolio/Layout";
import { cards as localCards, type Card } from "@/lib/mock-data";
import { mapCardsPayload } from "@/lib/clash/mappers";
import { cardsAction, errorMessage, isConvexConfigured } from "@/lib/convex";

export default function DecksPage() {
  return isConvexConfigured ? <LiveDeckBuilder /> : <DeckBuilder cards={localCards} source="Local catalog" />;
}

function LiveDeckBuilder() {
  const getCards = useAction(cardsAction);
  const [refreshKey, setRefreshKey] = useState(0);
  const query = useQuery({
    queryKey: ["cards", refreshKey],
    queryFn: async () => mapCardsPayload(await getCards({ force: refreshKey > 0 })),
    placeholderData: (previous) => previous,
    retry: false
  });

  if (query.isLoading) {
    return <Layout><div className="data-state"><LoaderCircle className="state-spinner" size={38} /><h1>Loading the card library</h1><p>Syncing cards from the Clash Royale API.</p></div></Layout>;
  }

  if (query.error || !query.data) {
    return <DeckBuilder cards={localCards} source={`Local fallback · ${errorMessage(query.error)}`} />;
  }

  return <DeckBuilder cards={query.data} source="Live Clash Royale card catalog" onRefresh={() => setRefreshKey((value) => value + 1)} isRefreshing={query.isFetching} />;
}

function DeckBuilder({ cards, source, onRefresh, isRefreshing = false }: { cards: Card[]; source: string; onRefresh?: () => void; isRefreshing?: boolean }) {
  const [selected, setSelected] = useState<Card[]>(() => cards.slice(0, 8));
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("All");
  const [notice, setNotice] = useState("");

  const filteredCards = useMemo(() => cards.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (rarity === "All" || card.rarity === rarity);
  }), [cards, rarity, search]);
  const averageElixir = selected.length ? selected.reduce((total, card) => total + card.elixir, 0) / selected.length : 0;

  function toggleCard(card: Card) {
    const exists = selected.some((item) => item.name === card.name);
    if (exists) {
      setSelected((items) => items.filter((item) => item.name !== card.name));
      setNotice("");
      return;
    }
    if (selected.length >= 8) {
      setNotice("A Clash Royale deck can only contain eight cards. Remove one first.");
      return;
    }
    setSelected((items) => [...items, card]);
    setNotice("");
  }

  async function copyDeck() {
    if (selected.length !== 8) {
      setNotice("Select exactly eight cards before copying your deck.");
      return;
    }
    const ids = selected.map((card) => card.id).filter((id): id is number => typeof id === "number");
    const value = ids.length === 8
      ? `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${ids.join(";")}`
      : selected.map((card) => card.name).join(", ");
    try {
      await navigator.clipboard.writeText(value);
      setNotice(ids.length === 8 ? "Official Clash Royale deck link copied." : "Deck list copied.");
    } catch {
      setNotice("Copying was blocked by your browser. Try again from a secure page.");
    }
  }

  return (
    <Layout>
      <Head><title>Deck Builder | Clash Crown</title><meta name="description" content="Build an eight-card Clash Royale deck from the live card catalog." /></Head>
      <div className="decks-page builder-page">
        <section className="decks-hero">
          <span className="eyebrow">{source}</span>
          <h1>Deck Builder</h1>
          <p>Choose eight cards, balance your elixir cost, and copy the finished deck into Clash Royale.</p>
        </section>

        <section className="builder-workspace profile-section">
          <div className="builder-summary">
            <div><span>Cards</span><strong>{selected.length}/8</strong></div>
            <div><span>Average elixir</span><strong>{averageElixir.toFixed(1)}</strong></div>
            <button type="button" onClick={() => setSelected([])}><Trash2 size={17} />Clear</button>
            <button type="button" className="pink-button" onClick={copyDeck}><Copy size={17} />Copy deck</button>
          </div>
          <div className="selected-deck" aria-label="Selected deck">
            {Array.from({ length: 8 }).map((_, index) => {
              const card = selected[index];
              return card ? (
                <button type="button" key={card.name} onClick={() => toggleCard(card)} aria-label={`Remove ${card.name}`}>
                  <Image src={card.image} alt={card.name} width={82} height={100} /><span>{card.elixir}</span>
                </button>
              ) : <div key={index} className="empty-card"><span>{index + 1}</span></div>;
            })}
          </div>
          {notice ? <p className="builder-notice" role="status">{notice}</p> : null}
        </section>

        <section className="card-browser profile-section">
          <div className="browser-toolbar">
            <label className="card-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cards" aria-label="Search cards" /></label>
            <label className="rarity-filter"><span className="sr-only">Filter rarity</span><select value={rarity} onChange={(event) => setRarity(event.target.value)}><option>All</option><option>Common</option><option>Rare</option><option>Epic</option><option>Legendary</option><option>Champion</option></select></label>
            {onRefresh ? <button type="button" className="refresh-catalog" onClick={onRefresh} disabled={isRefreshing}><RefreshCcw className={isRefreshing ? "spin" : ""} size={17} />Refresh catalog</button> : null}
          </div>
          <div className="card-library">
            {filteredCards.map((card) => {
              const active = selected.some((item) => item.name === card.name);
              return (
                <button type="button" key={card.name} className={active ? "selected" : ""} onClick={() => toggleCard(card)} aria-pressed={active}>
                  {active ? <Check className="selected-check" size={17} /> : null}
                  <Image src={card.image} alt={card.name} width={76} height={94} />
                  <strong>{card.name}</strong><span>{card.rarity} · {card.elixir || "?"}</span>
                </button>
              );
            })}
          </div>
          {!filteredCards.length ? <p className="empty-results">No cards match those filters.</p> : null}
        </section>
      </div>
    </Layout>
  );
}
