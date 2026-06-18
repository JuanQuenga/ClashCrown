import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Copy } from "lucide-react";
import { Layout } from "@/components/portfolio/Layout";
import { cards, player, type Card } from "@/lib/mock-data";

const decks = [
  {
    name: "Hog Control",
    cards: player.deck,
    winRate: "55.67%",
    games: "12 247",
    crowns: "0.77",
    cost: "4.5"
  },
  {
    name: "Giant Pressure",
    cards: [cards[2], cards[1], cards[8], cards[3], cards[10], cards[5], cards[6], cards[7]],
    winRate: "53.18%",
    games: "9 804",
    crowns: "0.82",
    cost: "4.2"
  },
  {
    name: "Miner Cycle",
    cards: [cards[14], cards[11], cards[4], cards[5], cards[8], cards[10], cards[7], cards[1]],
    winRate: "51.92%",
    games: "7 331",
    crowns: "0.69",
    cost: "3.6"
  }
];

export default function DecksPage() {
  return (
    <Layout>
      <Head>
        <title>Decks | Clash Crown</title>
      </Head>
      <div className="decks-page">
        <section className="decks-hero">
          <h1>Deck Builder</h1>
          <p>Find strong Clash Royale decks by win rate, usage, and average elixir cost.</p>
          <div className="decks-filters">
            <button type="button">Arena <ChevronDown size={16} /></button>
            <button type="button">Trophies <ChevronDown size={16} /></button>
            <button type="button">Winrate <ChevronDown size={16} /></button>
          </div>
        </section>

        <section className="profile-section decks-list">
          <div className="section-heading">
            <button type="button" className="filter-button">Popular</button>
            <h2>Top Decks</h2>
            <Link href="/players/CCDEMO" className="pink-button">Top players</Link>
          </div>
          <div className="deck-list">
            {decks.map((deck) => (
              <article key={deck.name} className="deck-list-item">
                <div className="deck-list-title">
                  <h3>{deck.name}</h3>
                  <div className="elixir-pill small"><Image src="/images/icons/elixir.png" alt="" width={28} height={28} />{deck.cost}<span>average cost</span></div>
                </div>
                <DeckCards cards={deck.cards} />
                <div className="deck-list-metrics">
                  <strong>{deck.winRate}<span>deck win rate</span></strong>
                  <strong>{deck.games}<span>games tracked</span></strong>
                  <strong>{deck.crowns}<span>crowns per game</span></strong>
                </div>
                <button type="button" className="copy-deck deck-copy"><Copy size={20} />Copy Deck</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function DeckCards({ cards }: { cards: Card[] }) {
  return (
    <div className="deck-card-grid">
      {cards.map((card, index) => (
        <div key={`${card.name}-${index}`} className="deck-card">
          <Image src={card.image} alt={card.name} width={72} height={88} />
          <span>{card.elixir}</span>
        </div>
      ))}
    </div>
  );
}
