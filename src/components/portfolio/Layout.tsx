import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { normalizeTag } from "@/lib/clash/tag";

const navItems = [
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/cards", label: "Cards" },
  { href: "/decks", label: "Deck Builder" },
  { href: "/clans/search", label: "Clans" },
  { href: "/tournaments", label: "Tournaments" }
];

export function Layout({ children, variant = "profile" }: { children: React.ReactNode; variant?: "home" | "profile" }) {
  return (
    <div className={`site-frame ${variant === "home" ? "site-frame-home" : ""}`}>
      <header className="site-header">
        <Link href="/" className="logo-link" aria-label="Clash Crown home">
          <Image src="/images/logo/clash-crown-purple-wide.png" alt="Clash Crown" width={315} height={100} priority />
        </Link>
        <nav className="top-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/#lookup" aria-label="Search Clash Royale profiles"><Search size={30} className="nav-search" /></Link>
        </nav>
      </header>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="social-row">
          <span>Facebook</span>
          <span>Twitter</span>
          <span>Discord</span>
        </div>
        <div className="footer-links">
          <Link href="/leaderboards">Leaderboards</Link>
          <Link href="/cards">Card Library</Link>
          <Link href="/decks">Deck Builder</Link>
          <Link href="/clans/search">Clan Search</Link>
          <Link href="/tournaments">Tournaments</Link>
          <Link href="/#lookup">Player Lookup</Link>
        </div>
        <p>
          This material is unofficial and is not endorsed by Supercell. For more information see Supercell&rsquo;s Fan
          Content Policy:{" "}
          <a href="https://supercell.com/en/fan-content-policy/" target="_blank" rel="noreferrer noopener">
            supercell.com/fan-content-policy
          </a>
          .
        </p>
        <p>© {new Date().getFullYear()} Clash Crown.</p>
      </div>
    </footer>
  );
}

export function DemoSearch() {
  const router = useRouter();
  const [kind, setKind] = useState<"players" | "clans">("players");
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const normalized = normalizeTag(tag);
      setError("");
      void router.push(`/${kind}/${normalized}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Enter a valid Clash Royale tag.");
    }
  }

  return (
    <div id="lookup" className="search-wrap">
      <form className="search-box" onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor="search-kind">Profile type</label>
        <select id="search-kind" className="search-type" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
          <option value="players">Player Tag</option>
          <option value="clans">Clan Tag</option>
        </select>
        <input aria-label={`${kind === "players" ? "Player" : "Clan"} tag`} placeholder="#PLAYER_TAG" value={tag} onChange={(event) => setTag(event.target.value)} />
        <button type="submit" className="search-submit" aria-label={`Search ${kind}`}><Search size={27} /></button>
      </form>
      {error ? <p className="search-error" role="alert">{error}</p> : null}
    </div>
  );
}
