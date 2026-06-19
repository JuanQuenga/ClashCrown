import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Crown, RefreshCcw, Swords, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DemoSearch, Layout } from "@/components/portfolio/Layout";
import { demoDecks, demoEvents, player, type Card, type Player } from "@/lib/mock-data";

const heroes = [
  { name: "Hog Rider", copy: "Fast lane pressure for trophy pushing.", art: "/images/art/hog-rider.png" },
  { name: "Goblinstein", copy: "New champion data joins the deck lab.", art: "/images/art/goblin-giant.png" },
  { name: "Royal Chef", copy: "Cook rotations before the arena timer burns.", art: "/images/art/royal-recruits.png" }
];

export default function HomePage() {
  const [activeHero, setActiveHero] = useState(0);
  const [activeDeck, setActiveDeck] = useState(0);
  const [battleIndex, setBattleIndex] = useState(0);
  const [archetype, setArchetype] = useState<"All" | "Control" | "Cycle" | "Beatdown" | "Bait">("All");

  const playerQuery = useQuery<Player>({
    queryKey: ["demo-player", "home"],
    queryFn: async () => {
      const response = await fetch("/api/demo/player");
      if (!response.ok) throw new Error("Unable to load demo player");
      return response.json();
    },
    initialData: player
  });

  const demoPlayer = playerQuery.data;
  const filteredDecks = useMemo(
    () => demoDecks.filter((deck) => archetype === "All" || deck.archetype === archetype),
    [archetype]
  );
  const selectedDeck = filteredDecks[Math.min(activeDeck, filteredDecks.length - 1)] ?? demoDecks[0];
  const selectedBattle = demoPlayer.battles[battleIndex % demoPlayer.battles.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHero((index) => (index + 1) % heroes.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Layout variant="home">
      <section className="home-hero">
        <h1>Track Your Clash Royale<br />Stats and Chests</h1>
        <DemoSearch />
        <div className="hero-cards">
          {heroes.map((hero, index) => (
            <button
              key={hero.name}
              type="button"
              className={`hero-card ${activeHero === index ? "active" : ""}`}
              onClick={() => setActiveHero(index)}
            >
              <div>
                <h2>{hero.name}</h2>
                <p>{hero.copy}</p>
              </div>
              <Image src={hero.art} alt={hero.name} width={220} height={220} />
            </button>
          ))}
        </div>
      </section>

      <section className="demo-command page-band">
        <div key={heroes[activeHero].name} className="command-spotlight">
          <Image src={heroes[activeHero].art} alt="" width={190} height={210} />
          <div>
            <span>Interactive mock demo</span>
            <h2>{heroes[activeHero].name} Console</h2>
            <p>{heroes[activeHero].copy} Change cards, rotate battles, refresh mock data, and preview the same data states a real Clash Royale integration would drive.</p>
          </div>
        </div>
        <div className="command-stats">
          <Metric icon={<Trophy size={19} />} value={demoPlayer.trophies.toLocaleString()} label="live trophies" />
          <Metric icon={<Crown size={19} />} value={selectedDeck.winRate.toFixed(1) + "%"} label="deck win rate" />
          <Metric icon={<Swords size={19} />} value={selectedBattle.result} label="last battle" />
          <button type="button" onClick={() => playerQuery.refetch()} className={playerQuery.isFetching ? "is-fetching" : ""}>
            <RefreshCcw size={17} />Refresh demo
          </button>
        </div>
      </section>

      <section className="game-day page-band">
        <div className="section-title-row">
          <h2>Game of the day</h2>
          <Link href="/players/CCDEMO" className="pink-button">See all games</Link>
        </div>
        <div className="game-board">
          <PlayerMini name={demoPlayer.name} clan={demoPlayer.clan} />
          <DeckStrip cards={selectedBattle.deck} />
          <div className="score-card">
            <span>{selectedBattle.date}</span>
            <strong><i>{selectedBattle.crowns[0]}</i> - <i>{selectedBattle.crowns[1]}</i></strong>
            <span>{selectedBattle.mode} · {selectedBattle.trophyChange > 0 ? "+" : ""}{selectedBattle.trophyChange}</span>
          </div>
          <DeckStrip cards={[...selectedBattle.deck].reverse()} />
          <PlayerMini name={selectedBattle.opponent} clan="Synetics" />
        </div>
        <Pager onPrevious={() => setBattleIndex((index) => (index + demoPlayer.battles.length - 1) % demoPlayer.battles.length)} onNext={() => setBattleIndex((index) => (index + 1) % demoPlayer.battles.length)} />
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
        <div className="archetype-tabs" aria-label="Deck archetype filters">
          {["All", "Control", "Cycle", "Beatdown", "Bait"].map((item) => (
            <button
              key={item}
              type="button"
              className={archetype === item ? "active" : ""}
              onClick={() => {
                setArchetype(item as typeof archetype);
                setActiveDeck(0);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="deck-row">
          <div className="elixir-pill">
            <Image src="/images/icons/elixir.png" alt="" width={26} height={26} />
            <strong>{selectedDeck.cost.toFixed(1)} elixir<span>average cost</span></strong>
          </div>
          <DeckStrip cards={selectedDeck.cards} />
          <button type="button" className="copy-deck" onClick={() => setActiveDeck((index) => (index + 1) % filteredDecks.length)}>
            <Image src="/images/icons/copy.png" alt="" width={26} height={28} />
            Swap Deck
          </button>
        </div>
        <div className="deck-demo-copy">
          <strong>{selectedDeck.name}</strong>
          <span>{selectedDeck.spotlight}</span>
        </div>
        <div className="deck-metrics">
          <strong>{selectedDeck.winRate.toFixed(1)}%<span>deck win rate</span></strong>
          <strong>{selectedDeck.usage.toFixed(1)}%<span>usage rate</span></strong>
          <strong>{selectedDeck.crowns.toFixed(2)}<span>crowns per game</span></strong>
        </div>
        <Pager onPrevious={() => setActiveDeck((index) => (index + filteredDecks.length - 1) % filteredDecks.length)} onNext={() => setActiveDeck((index) => (index + 1) % filteredDecks.length)} />
      </section>

      <section className="event-lab page-band">
        <div className="section-title-row">
          <h2>Event Lab</h2>
          <Link href="/clans/CCDEMO" className="pink-button">Clan board</Link>
        </div>
        <div className="event-grid">
          {demoEvents.map((event) => (
            <article key={event.name} className="event-card">
              <Image src={event.image} alt="" width={88} height={108} />
              <div>
                <span>{event.mode}</span>
                <strong>{event.name}</strong>
                <small>{event.reward}</small>
                <div className="event-progress"><i style={{ width: `${event.progress}%` }} /></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="chest-demo page-band">
        <div className="section-title-row">
          <h2>Chest Timeline</h2>
          <button type="button" className="pink-button" onClick={() => playerQuery.refetch()}>Resync</button>
        </div>
        <div className="chest-demo-row">
          {demoPlayer.chests.slice(0, 8).map((chest, index) => (
            <div key={`${chest.name}-${index}`} className={index === 0 ? "active" : ""}>
              <Image src={chest.image} alt={chest.name} width={58} height={58} />
              <strong>{index === 0 ? "Next" : `+${chest.index}`}</strong>
              <span>{chest.name}</span>
            </div>
          ))}
        </div>
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

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="command-metric">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
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

function DeckStrip({ cards }: { cards: Card[] }) {
  return (
    <div className="deck-strip">
      {cards.map((card, index) => (
        <Image key={`${card.name}-${index}`} src={card.image} alt={card.name} width={54} height={66} />
      ))}
    </div>
  );
}

function Pager({ onPrevious, onNext }: { onPrevious?: () => void; onNext?: () => void }) {
  return (
    <div className="pager">
      <button type="button" aria-label="Previous" onClick={onPrevious}><ChevronLeft size={18} /></button>
      <button type="button" aria-label="Next" onClick={onNext}><ChevronRight size={18} /></button>
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
