export type ApiIconUrls = {
  medium?: string;
};

export type ApiCard = {
  id: number;
  name: string;
  elixirCost?: number;
  rarity?: string;
  iconUrls?: ApiIconUrls;
};

export type ApiArena = {
  id?: number;
  name?: string;
};

export type ApiClanReference = {
  tag?: string;
  name?: string;
  badgeId?: number;
};

export type ApiPlayer = {
  tag: string;
  name: string;
  expLevel?: number;
  trophies?: number;
  bestTrophies?: number;
  wins?: number;
  losses?: number;
  battleCount?: number;
  threeCrownWins?: number;
  challengeCardsWon?: number;
  challengeMaxWins?: number;
  tournamentCardsWon?: number;
  tournamentBattleCount?: number;
  donations?: number;
  donationsReceived?: number;
  totalDonations?: number;
  warDayWins?: number;
  clanCardsCollected?: number;
  arena?: ApiArena;
  clan?: ApiClanReference;
  currentDeck?: ApiCard[];
  currentFavouriteCard?: ApiCard;
  cards?: ApiCard[];
};

export type ApiBattleParticipant = {
  tag?: string;
  name?: string;
  crowns?: number;
  trophyChange?: number;
  clan?: ApiClanReference;
  cards?: ApiCard[];
};

export type ApiBattle = {
  type?: string;
  battleTime?: string;
  gameMode?: { name?: string };
  team?: ApiBattleParticipant[];
  opponent?: ApiBattleParticipant[];
};

export type ApiChest = {
  index?: number;
  name?: string;
};

export type ApiChestList = {
  items?: ApiChest[];
};

export type ApiClanMember = {
  tag?: string;
  name?: string;
  role?: string;
  expLevel?: number;
  trophies?: number;
  clanRank?: number;
  donations?: number;
};

export type ApiClan = {
  tag: string;
  name: string;
  type?: string;
  description?: string;
  badgeId?: number;
  clanScore?: number;
  clanWarTrophies?: number;
  requiredTrophies?: number;
  donationsPerWeek?: number;
  members?: number;
  memberList?: ApiClanMember[];
};

export type ApiCardList = {
  items?: ApiCard[];
};

export type CachedPayload<T> = {
  data: T;
  fetchedAt: number;
  stale: boolean;
};

export type PlayerBundlePayload = {
  player: CachedPayload<ApiPlayer>;
  battles: CachedPayload<ApiBattle[]>;
  chests: CachedPayload<ApiChestList>;
};

export type ClanBundlePayload = {
  clan: CachedPayload<ApiClan>;
};

export type CardsPayload = {
  cards: CachedPayload<ApiCardList>;
};
