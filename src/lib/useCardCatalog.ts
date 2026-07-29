import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { mapCardList } from "@/lib/clash/mappers";
import { cardsAction } from "@/lib/convex";
import type { Card } from "@/lib/mock-data";

/**
 * Card id -> card, for turning the numeric ids in deck statistics into art.
 *
 * Every caller shares one `card-library` query key, so the catalog is fetched
 * once per session no matter how many meta surfaces are on screen. Requires the
 * Convex provider, so only call it from a subtree gated on `isConvexConfigured`.
 */
export function useCardCatalog() {
  const getCards = useAction(cardsAction);
  const catalog = useQuery({
    queryKey: ["card-library"],
    queryFn: async () => mapCardList((await getCards({})).cards.data),
    staleTime: 60 * 60 * 1000,
    retry: false
  });

  return useMemo(() => {
    const byId = new Map<number, Card>();
    for (const card of catalog.data ?? []) if (typeof card.id === "number") byId.set(card.id, card);
    return byId;
  }, [catalog.data]);
}
