import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import type { Chest, Player } from "@/lib/mock-data";

const tabItems = [
  { label: "Statistics", icon: "/images/icons/trophy.png", active: true },
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
      <h1>{player.name}<Image src="/images/levels/13.png" alt="Level 13" width={34} height={34} /></h1>
      <strong>#{player.tag}</strong>
    </section>
  );
}

export function PlayerTabs() {
  return (
    <nav className="profile-tabs" aria-label="Player sections">
      {tabItems.map((tab) => (
        <button key={tab.label} type="button" className={tab.active ? "active" : ""}>
          <Image src={tab.icon} alt="" width={44} height={44} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export function PlayerStats({ player }: { player: Player }) {
  const rows = [
    ["Highest trophies", player.bestTrophies.toLocaleString()],
    ...Object.entries(player.stats)
  ];

  return (
    <section className="profile-section">
      <div className="section-tools">
        <FilterButton />
        <div className="update-tools"><span>last updated 56 min ago</span><button type="button"><RefreshCcw size={16} />Refresh</button></div>
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

export function ProgressionChart({ title = "Progression" }: { title?: string }) {
  return (
    <section className="profile-section chart-section">
      <div className="section-heading">
        <FilterButton />
        <h2>{title}</h2>
        <div className="arrow-tools">
          <button type="button" aria-label="Previous"><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Next"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="line-chart">
        <div className="y-axis">
          <Image src="/images/icons/trophy.png" alt="" width={24} height={24} />
          <span>6k</span><span>4k</span><span>2k</span><span>1k</span>
        </div>
        <svg viewBox="0 0 930 250" aria-label={`${title} line chart`}>
          <defs>
            <linearGradient id={`chart-fill-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b8cff" stopOpacity=".36" />
              <stop offset="100%" stopColor="#1b8cff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 10 }).map((_, index) => (
            <line key={index} x1={70 + index * 86} x2={70 + index * 86} y1="18" y2="205" className="grid-line" />
          ))}
          <path className="chart-fill" d="M22 174 C76 168 76 70 143 80 C203 92 170 224 238 214 C300 204 296 84 371 102 C452 122 447 130 495 120 C548 108 544 28 608 30 C682 34 642 176 717 172 C773 168 780 95 832 105 C891 116 880 176 920 166 L920 228 L22 228 Z" fill={`url(#chart-fill-${title})`} />
          <path d="M22 174 C76 168 76 70 143 80 C203 92 170 224 238 214 C300 204 296 84 371 102 C452 122 447 130 495 120 C548 108 544 28 608 30 C682 34 642 176 717 172 C773 168 780 95 832 105 C891 116 880 176 920 166" />
          <circle cx="717" cy="172" r="8" />
          <foreignObject x="667" y="106" width="110" height="42">
            <div className="chart-popover"><Image src="/images/icons/trophy.png" alt="" width={21} height={21} />4198</div>
          </foreignObject>
        </svg>
        <div className="x-axis">
          {["Sep 06", "Sep 07", "Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Oct 16"].map((date) => (
            <span key={date}>{date}</span>
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
    <button type="button" className="filter-button">
      Trophies <ChevronDown size={16} />
    </button>
  );
}
