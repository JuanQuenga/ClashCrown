import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { Layout } from "@/components/portfolio/Layout";
import { ErrorState, LoadingState, SetupState } from "@/components/portfolio/AsyncState";
import { rarityImage } from "@/lib/clash/assets";
import { cardSlug, findCardBySlug, relatedCards } from "@/lib/clash/cards";
import { mapCardList, mapSupportCardList } from "@/lib/clash/mappers";
import type { Card } from "@/lib/mock-data";
import { cardsAction, errorMessage, isConvexConfigured } from "@/lib/convex";

export default function CardDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";

  if (!router.isReady) {
    return (
      <Layout>
        <LoadingState label="card" />
      </Layout>
    );
  }
  if (!isConvexConfigured) {
    return (
      <Layout>
        <SetupState feature="card pages" />
      </Layout>
    );
  }
  return <CardDetail slug={slug} />;
}

function CardDetail({ slug }: { slug: string }) {
  const getCards = useAction(cardsAction);
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

  const all = useMemo(() => [...(query.data?.cards ?? []), ...(query.data?.towerTroops ?? [])], [query.data]);
  const card = useMemo(() => findCardBySlug(all, slug), [all, slug]);
  const related = useMemo(() => (card ? relatedCards(query.data?.cards ?? [], card) : []), [query.data, card]);

  if (query.isLoading) {
    return (
      <Layout>
        <LoadingState label="card" />
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
  if (!card) {
    return (
      <Layout>
        <ErrorState message={`No card called “${slug}” exists in the live catalog.`} />
      </Layout>
    );
  }

  const rarityIcon = rarityImage(card.rarity);

  return (
    <Layout>
      <Head>
        <title>{`${card.name} | Clash Crown`}</title>
        <meta name="description" content={`${card.name} — ${card.rarity} card costing ${card.elixir} elixir.`} />
      </Head>
      <div className="profile-page">
        <section className="card-detail-hero">
          <Image src={card.image} alt={card.name} width={180} height={220} priority />
          <div>
            <span className="eyebrow">
              <Link href="/cards">← All cards</Link>
            </span>
            <h1>{card.name}</h1>
            <div className="card-detail-meta">
              <span className={`rarity-chip rarity-${card.rarity.toLowerCase()}`}>
                {rarityIcon ? <Image src={rarityIcon} alt="" width={20} height={20} /> : null}
                {card.rarity}
              </span>
              <span className="elixir-chip">
                <Image src="/images/icons/elixir.png" alt="" width={20} height={20} />
                {card.elixir || "?"} elixir
              </span>
              {card.canEvolve ? <span className="evo-chip">Evolution available</span> : null}
            </div>
            <Link href={`/decks?include=${cardSlug(card.name)}`} className="pink-button">
              Build a deck with {card.name}
            </Link>
          </div>
        </section>

        <section className="profile-section">
          <h2>Similar cards</h2>
          <p className="table-note">
            Cards of the same rarity and a comparable elixir cost. Usage and win-rate statistics need a battle history we
            do not collect yet.
          </p>
          <div className="card-library">
            {related.map((item) => (
              <RelatedTile key={item.id ?? item.name} card={item} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function RelatedTile({ card }: { card: Card }) {
  return (
    <Link href={`/cards/${cardSlug(card.name)}`} className="card-tile">
      <Image src={card.image} alt={card.name} width={76} height={94} />
      <strong>{card.name}</strong>
      <span>
        {card.rarity} · {card.elixir || "?"}
      </span>
    </Link>
  );
}
