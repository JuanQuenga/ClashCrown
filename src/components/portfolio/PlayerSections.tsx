import Image from "next/image";
import { RefreshCcw } from "lucide-react";
import type { Battle, Card, Chest, Player } from "@/lib/mock-data";

const tabItems = [
  { label: "Statistics", icon: "/images/icons/trophy.png" },
  { label: "Battles", icon: "/images/icons/sword.png" },
  { label: "Decks", icon: "/images/icons/cardsq.png" },
  { label: "Cards", icon: "/images/icons/book-cards.png" }
];

const statIcons = [
  "/images/icons/trophy.png",
  "/images/icons/trophy.png",
  "/images/icons/cardsq.png",
  "/images/icons/ranklegendary.png",
  "/images/clan-badges/16000004.png",
  "/images/arenas/league9.png",
  "/images/arenas/league9.png",
  "/images/arenas/league9.png",
  "/images/icons/sword.png",
  "/images/icons/sword.png",
  "/images/icons/crown-2d.png",
  "/images/icons/crown-gold.png"
];

export function PlayerHero({ player }: { player: Player }) {
  return (
    <section className="profile-hero">
      <Image src="/images/clan-badges/16000004.png" alt="" width={74} height={92} priority />
      <span>{player.clan} &gt;</span>
      <h1>{player.name}<span className="hero-level" aria-label={`Level ${player.level}`}>{player.level}</span></h1>
      <strong>#{player.tag}</strong>
    </section>
  );
}

export type PlayerTab = "Statistics" | "Battles" | "Decks" | "Cards";

export function PlayerTabs({ active, onChange }: { active: PlayerTab; onChange: (tab: PlayerTab) => void }) {
  return (
    <nav className="profile-tabs" aria-label="Player sections">
      {tabItems.map((tab) => (
        <button key={tab.label} type="button" className={active === tab.label ? "active" : ""} onClick={() => onChange(tab.label as PlayerTab)}>
          <Image src={tab.icon} alt="" width={44} height={44} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export function PlayerStats({ player, onRefresh, isRefreshing }: { player: Player; onRefresh: () => void; isRefreshing: boolean }) {
  const rows = [
    ["Highest trophies", player.bestTrophies.toLocaleString()],
    ...Object.entries(player.stats)
  ];

  return (
    <section className="profile-section">
      <div className="section-tools">
        <FilterButton />
        <div className="update-tools"><span>{updatedLabel(player.fetchedAt)}</span><button type="button" onClick={onRefresh} disabled={isRefreshing}><RefreshCcw className={isRefreshing ? "spin" : ""} size={16} />{isRefreshing ? "Refreshing" : "Refresh"}</button></div>
      </div>
      <div className="stat-matrix">
        {rows.map(([label, value], index) => (
          <div key={label} className="stat-cell">
            <Image src={statIcons[index] ?? "/images/icons/trophy.png"} alt="" width={46} height={46} />
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BattleHistory({ battles }: { battles: Battle[] }) {
  if (!battles.length) return <EmptyPanel title="No recent battles" copy="The API did not return any battles for this player." />;

  return (
    <section className="profile-section">
      <div className="section-heading compact-heading"><span className="filter-button static">Recent</span><h2>Battle Log</h2><span /></div>
      <div className="battle-history">
        {battles.map((battle, index) => (
          <article key={`${battle.date}-${battle.opponent}-${index}`} className={`battle-card ${battle.result.toLowerCase()}`}>
            <div className="battle-result"><strong>{battle.result}</strong><span>{battle.mode}</span><small>{battle.date}</small></div>
            <div className="battle-opponent"><span>Opponent</span><strong>{battle.opponent}</strong><small>{battle.opponentClan ?? "No clan"}</small></div>
            <div className="battle-score"><strong>{battle.crowns[0]}–{battle.crowns[1]}</strong><span>{battle.trophyChange > 0 ? "+" : ""}{battle.trophyChange} trophies</span></div>
            <MiniDeck cards={battle.deck} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function DeckOverview({ cards }: { cards: Card[] }) {
  if (!cards.length) return <EmptyPanel title="No current deck" copy="This player's current deck is private or unavailable." />;
  const average = cards.reduce((sum, card) => sum + card.elixir, 0) / cards.length;
  return (
    <section className="profile-section deck-overview">
      <div className="section-heading compact-heading"><span className="filter-button static">{average.toFixed(1)} elixir</span><h2>Current Deck</h2><span /></div>
      <div className="collection-grid deck-collection">
        {cards.map((card, index) => <CollectionCard key={`${card.name}-${index}`} card={card} />)}
      </div>
    </section>
  );
}

export function CardCollection({ cards }: { cards: Card[] }) {
  if (!cards.length) return <EmptyPanel title="No cards available" copy="The API did not return this player's card collection." />;
  return (
    <section className="profile-section">
      <div className="section-heading compact-heading"><span className="filter-button static">{cards.length} cards</span><h2>Card Collection</h2><span /></div>
      <div className="collection-grid">
        {cards.map((card, index) => <CollectionCard key={`${card.name}-${index}`} card={card} />)}
      </div>
    </section>
  );
}

function MiniDeck({ cards }: { cards: Card[] }) {
  return <div className="mini-deck">{cards.slice(0, 8).map((card, index) => <Image key={`${card.name}-${index}`} src={card.image} alt={card.name} width={42} height={52} />)}</div>;
}

function CollectionCard({ card }: { card: Card }) {
  return (
    <article className="collection-card">
      <Image src={card.image} alt={card.name} width={82} height={100} />
      <strong>{card.name}</strong>
      <span>{card.rarity} · {card.elixir || "?"} elixir</span>
    </article>
  );
}

function EmptyPanel({ title, copy }: { title: string; copy: string }) {
  return <section className="profile-section empty-panel"><h2>{title}</h2><p>{copy}</p></section>;
}

function updatedLabel(fetchedAt?: number) {
  if (!fetchedAt) return "demo data";
  const minutes = Math.max(0, Math.floor((Date.now() - fetchedAt) / 60_000));
  return minutes < 1 ? "updated just now" : `updated ${minutes}m ago`;
}

export function ProgressionChart({ player }: { player: Player }) {
  const recentBattles = player.battles.slice(0, 10).reverse();
  const startingTrophies = player.trophies - recentBattles.reduce((total, battle) => total + battle.trophyChange, 0);
  const values = recentBattles.reduce<number[]>((points, battle) => {
    points.push((points.at(-1) ?? startingTrophies) + battle.trophyChange);
    return points;
  }, [startingTrophies]);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = Math.max(1, maximum - minimum);
  const coordinates = values.map((value, index) => ({
    x: values.length === 1 ? 470 : 22 + (index / (values.length - 1)) * 898,
    y: 210 - ((value - minimum) / range) * 170,
    value
  }));
  const linePath = coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coordinates.at(-1)?.x ?? 920} 228 L${coordinates[0]?.x ?? 22} 228 Z`;
  const latest = coordinates.at(-1) ?? { x: 470, y: 125, value: player.trophies };
  const labels = ["Start", ...recentBattles.map((battle) => battle.date)];

  return (
    <section className="profile-section chart-section">
      <div className="section-heading">
        <FilterButton />
        <h2>Trophy Activity</h2>
        <span className="chart-range">Last {recentBattles.length} battles</span>
      </div>
      <div className="line-chart">
        <div className="y-axis">
          <Image src="/images/icons/trophy.png" alt="" width={24} height={24} />
          <span>{maximum.toLocaleString()}</span><span>{Math.round((maximum + minimum) / 2).toLocaleString()}</span><span>{minimum.toLocaleString()}</span>
        </div>
        <svg viewBox="0 0 930 250" aria-label="Recent trophy activity line chart">
          <defs>
            <linearGradient id="chart-fill-trophies" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b8cff" stopOpacity=".36" />
              <stop offset="100%" stopColor="#1b8cff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 10 }).map((_, index) => (
            <line key={index} x1={70 + index * 86} x2={70 + index * 86} y1="18" y2="205" className="grid-line" />
          ))}
          <path className="chart-fill" d={areaPath} fill="url(#chart-fill-trophies)" />
          <path d={linePath} />
          <circle cx={latest.x} cy={latest.y} r="8" />
          <foreignObject x={Math.max(0, Math.min(820, latest.x - 50))} y={Math.max(0, latest.y - 58)} width="110" height="42">
            <div className="chart-popover"><Image src="/images/icons/trophy.png" alt="" width={21} height={21} />{latest.value}</div>
          </foreignObject>
        </svg>
        <div className="x-axis">
          {labels.map((date, index) => (
            <span key={`${date}-${index}`}>{index === 0 ? date : date.replace(/, \d{4}$/, "")}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ChestList({ chests }: { chests: Chest[] }) {
  return (
    <section className="chest-footer">
      <h2>My Chests</h2>
      <div className="chest-row">
        {chests.map((chest, index) => (
          <div key={`${chest.name}-${index}`} className="chest-item">
            <Image src={chest.image} alt={chest.name} width={58} height={58} />
            <strong>+{chest.index}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function FilterButton() {
  return (
    <span className="filter-button static">Trophies</span>
  );
}
