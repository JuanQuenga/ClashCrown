import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DemoSearch, Layout } from "@/components/portfolio/Layout";
import { player } from "@/lib/mock-data";

const heroes = [
  { name: "Hog Rider", copy: "the Hog Rider punishes those who hide behind their puny walls!", art: "/images/art/hog-rider.png" },
  { name: "The Bowler", copy: "the Hog Rider punishes those who hide behind their puny walls!", art: "/images/art/the-bowler.png" },
  { name: "Prince", copy: "the Hog Rider punishes those who hide behind their puny walls!", art: "/images/art/prince.png" }
];

export default function HomePage() {
  return (
    <Layout variant="home">
      <section className="home-hero">
        <h1>Track Your Clash Royale<br />Stats and Chests</h1>
        <DemoSearch />
        <div className="hero-cards">
          {heroes.map((hero) => (
            <article key={hero.name} className="hero-card">
              <div>
                <h2>{hero.name}</h2>
                <p>{hero.copy}</p>
              </div>
              <Image src={hero.art} alt={hero.name} width={220} height={220} />
            </article>
          ))}
        </div>
      </section>

      <section className="game-day page-band">
        <div className="section-title-row">
          <h2>Game of the day</h2>
          <Link href="/players/CCDEMO" className="pink-button">See all games</Link>
        </div>
        <div className="game-board">
          <PlayerMini name="Dark Light" clan="Mega Stars" />
          <DeckStrip cards={player.deck} />
          <div className="score-card">
            <span>25 Jun, 2017</span>
            <strong><i>3</i> - <i>2</i></strong>
            <span>10 min ago</span>
          </div>
          <DeckStrip cards={[...player.deck].reverse()} />
          <PlayerMini name="SuperBag" clan="Synetics" />
        </div>
        <Pager />
      </section>

      <section className="mirror-band">
        <Image src="/images/art/mirror-battle-week.png" alt="Mirror Battle Week" width={365} height={190} />
        <button type="button" aria-label="Previous"><ChevronLeft size={24} /></button>
        <button type="button" aria-label="Next"><ChevronRight size={24} /></button>
      </section>

      <section className="deck-day page-band">
        <div className="section-title-row">
          <h2>Deck of the day</h2>
          <Link href="/decks" className="pink-button">See all decks</Link>
        </div>
        <div className="deck-row">
          <div className="elixir-pill">
            <Image src="/images/icons/elixir.png" alt="" width={26} height={26} />
            <strong>4.5 elixir<span>average cost</span></strong>
          </div>
          <DeckStrip cards={player.deck} />
          <Link href="/decks" className="copy-deck">
            <Image src="/images/icons/copy.png" alt="" width={26} height={28} />
            Copy Deck
          </Link>
        </div>
        <div className="deck-metrics">
          <strong>55.67%<span>deck win rate</span></strong>
          <strong>12 247<span>games tracked</span></strong>
          <strong>0.77<span>crowns per game</span></strong>
        </div>
        <Pager />
      </section>

      <section className="popular page-band">
        <div className="section-title-row">
          <h2>Popular Cards</h2>
          <Link href="/decks" className="pink-button">See all cards</Link>
        </div>
        <div className="popular-grid">
          <SparkChart color="pink" label="Winrate" value="43.21%" delta="-3.23%" />
          <div className="popular-card-center">
            <Image src="/images/cards/three-musketeers.png" alt="Three Musketeers" width={96} height={120} />
            <strong>Three Musketeers</strong>
          </div>
          <SparkChart color="blue" label="Usage" value="73.21%" delta="+3.23%" />
        </div>
        <Pager />
      </section>
    </Layout>
  );
}

function PlayerMini({ name, clan }: { name: string; clan: string }) {
  return (
    <div className="player-mini">
      <Image src="/images/clan-badges/16000004.png" alt="" width={42} height={52} />
      <span>{clan} &gt;</span>
      <strong>{name}</strong>
      <small><Image src="/images/icons/trophy.png" alt="" width={16} height={16} />5877 <b>+27</b></small>
    </div>
  );
}

function DeckStrip({ cards }: { cards: typeof player.deck }) {
  return (
    <div className="deck-strip">
      {cards.map((card, index) => (
        <Image key={`${card.name}-${index}`} src={card.image} alt={card.name} width={54} height={66} />
      ))}
    </div>
  );
}

function Pager() {
  return (
    <div className="pager">
      <button type="button" aria-label="Previous"><ChevronLeft size={18} /></button>
      <button type="button" aria-label="Next"><ChevronRight size={18} /></button>
    </div>
  );
}

function SparkChart({ color, label, value, delta }: { color: "pink" | "blue"; label: string; value: string; delta: string }) {
  return (
    <div className={`spark spark-${color}`}>
      <div className="spark-label">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{delta}</small>
      </div>
      <svg viewBox="0 0 360 120" aria-hidden="true">
        <path d="M4 92 C30 90 38 18 67 20 C94 22 86 72 126 70 C164 68 160 82 196 82 C228 82 226 98 260 94 C287 90 292 54 318 64 C340 72 338 98 356 92" />
      </svg>
    </div>
  );
}
