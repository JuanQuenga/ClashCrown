export type Card = {
  name: string;
  elixir: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Champion";
  image: string;
};

export type Battle = {
  mode: string;
  date: string;
  result: "Win" | "Loss";
  crowns: [number, number];
  opponent: string;
  trophyChange: number;
  deck: Card[];
};

export type Chest = {
  name: string;
  index: number;
  image: string;
};

export type Player = {
  tag: string;
  name: string;
  level: number;
  trophies: number;
  bestTrophies: number;
  arena: string;
  arenaImage: string;
  clan: string;
  favoriteCard: Card;
  stats: Record<string, string>;
  deck: Card[];
  cards: Card[];
  chests: Chest[];
  battles: Battle[];
};

export type ClanMember = {
  name: string;
  role: string;
  trophies: number;
  donations: number;
};

export type Clan = {
  tag: string;
  name: string;
  badge: string;
  warBadge: string;
  description: string;
  score: number;
  warTrophies: number;
  donations: number;
  members: ClanMember[];
};

const card = (
  name: string,
  elixir: number,
  rarity: Card["rarity"],
  slug = name.toLowerCase().replaceAll(" ", "-").replaceAll(".", "")
): Card => ({
  name,
  elixir,
  rarity,
  image: `/images/cards/${slug}.png`
});

export const cards = [
  card("Hog Rider", 4, "Rare"),
  card("Fireball", 4, "Rare"),
  card("Giant", 5, "Rare"),
  card("Ice Wizard", 3, "Legendary"),
  card("Witch", 5, "Epic", "night-witch"),
  card("Mega Knight", 7, "Legendary"),
  card("Three Musketeers", 9, "Rare"),
  card("Goblin Gang", 3, "Common"),
  card("Knight", 3, "Common"),
  card("Prince", 5, "Epic"),
  card("Zap", 2, "Common"),
  card("The Log", 2, "Legendary"),
  card("Phoenix", 4, "Legendary"),
  card("Skeleton King", 4, "Champion"),
  card("Miner", 3, "Legendary"),
  card("Goblin Barrel", 3, "Epic")
];

const deck = cards.slice(0, 8);

export const player: Player = {
  tag: "9LPRVLD0",
  name: "Dark Light",
  level: 13,
  trophies: 5933,
  bestTrophies: 6753,
  arena: "Legendary Arena",
  arenaImage: "/images/arenas/league9.png",
  clan: "Mega Stars",
  favoriteCard: cards[6],
  deck,
  cards,
  stats: {
    "Last known trophies": "5,933",
    "Challenge cards won": "486,447",
    "Tourney cards won": "6,811",
    "Total donations": "150",
    "Prev season rank": "732",
    "Prev season trophies": "5,593",
    "Prev season highest": "5,798",
    Wins: "6,647",
    Losses: "4,431",
    "3 crown wins": "2,217",
    League: "Champion"
  },
  chests: [
    { name: "Golden Chest", index: 20, image: "/images/chests/goldenchest.png" },
    { name: "Silver Chest", index: 2, image: "/images/chests/silverchest.png" },
    { name: "Silver Chest", index: 3, image: "/images/chests/silverchest.png" },
    { name: "Silver Chest", index: 7, image: "/images/chests/silverchest.png" },
    { name: "Golden Chest", index: 20, image: "/images/chests/goldenchest.png" },
    { name: "Silver Chest", index: 22, image: "/images/chests/silverchest.png" },
    { name: "Silver Chest", index: 22, image: "/images/chests/silverchest.png" },
    { name: "Silver Chest", index: 22, image: "/images/chests/silverchest.png" },
    { name: "Golden Chest", index: 20, image: "/images/chests/goldenchest.png" },
    { name: "Mega Lightning", index: 20, image: "/images/chests/megalightningchest.png" },
    { name: "Mega Lightning", index: 20, image: "/images/chests/megalightningchest.png" },
    { name: "Mega Lightning", index: 20, image: "/images/chests/megalightningchest.png" },
    { name: "Mega Lightning", index: 20, image: "/images/chests/megalightningchest.png" },
    { name: "Mega Lightning", index: 20, image: "/images/chests/megalightningchest.png" }
  ],
  battles: [
    {
      mode: "Ladder",
      date: "Jun 18, 2026",
      result: "Win",
      crowns: [3, 1],
      opponent: "SuperBag",
      trophyChange: 27,
      deck
    },
    {
      mode: "Classic Challenge",
      date: "Jun 17, 2026",
      result: "Win",
      crowns: [2, 1],
      opponent: "ANONSHA",
      trophyChange: 0,
      deck: [cards[8], cards[1], cards[2], cards[3], cards[10], cards[5], cards[6], cards[7]]
    },
    {
      mode: "Ladder",
      date: "Jun 16, 2026",
      result: "Loss",
      crowns: [1, 2],
      opponent: "DankLORD",
      trophyChange: -18,
      deck
    }
  ]
};

export const clan: Clan = {
  tag: "9LPRVLOO",
  name: "Mega Stars",
  badge: "/images/clan-badges/16000004.png",
  warBadge: "/images/war/gold-1.png",
  description: "WELCOME TO MEGASTAR | TWITTER @MEGAGAMINGCR | PB 5800 to join",
  score: 48625,
  warTrophies: 4300,
  donations: 25928,
  members: [
    { name: "ANONSHA", role: "Member", trophies: 5256, donations: 284 },
    { name: "alooo", role: "Elder", trophies: 5125, donations: 284 },
    { name: "Dark Light", role: "Co-Leader", trophies: 5022, donations: 284 },
    { name: "DankLORD", role: "Leader", trophies: 4948, donations: 284 },
    { name: "Snow Mexican", role: "Member", trophies: 4785, donations: 284 },
    { name: "hazimeyacho-", role: "Member", trophies: 4672, donations: 284 },
    { name: "Blitz2", role: "Member", trophies: 4553, donations: 284 },
    { name: "ERWINDJOHAN", role: "Elder", trophies: 4387, donations: 284 },
    { name: "E F E", role: "Co-Leader", trophies: 4331, donations: 284 },
    { name: "Roei", role: "Member", trophies: 4222, donations: 284 },
    { name: "*NNKI*", role: "Member", trophies: 4192, donations: 284 },
    { name: "QooBee", role: "Member", trophies: 3989, donations: 284 }
  ]
};

export const portfolioNotes = [
  "Track player trophies, decks, cards, and upcoming chests",
  "Follow clan progress, members, donations, and rankings",
  "Browse daily battles, decks, cards, and tournament views"
];

export function getPlayer() {
  return Promise.resolve(player);
}

export function getClan() {
  return Promise.resolve(clan);
}
