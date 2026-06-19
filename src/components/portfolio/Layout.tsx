import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

const navItems = [
  { href: "/decks", label: "Cards" },
  { href: "/", label: "Championship" },
  { href: "/", label: "Tournaments" },
  { href: "/decks", label: "Deck Builder" },
  { href: "/clans/CCDEMO", label: "Top Lists" }
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
          <ChevronDown size={14} className="nav-caret" />
          <Search size={30} className="nav-search" />
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
          <Link href="/decks">Top Decks</Link>
          <Link href="/decks">Top Cards</Link>
          <Link href="/players/CCDEMO">Top Players</Link>
          <Link href="/clans/CCDEMO">Top Clans</Link>
          <Link href="/">Tournaments</Link>
          <Link href="/">Championship</Link>
          <Link href="/decks">Cards</Link>
        </div>
        <p>
          This content is not affiliated with, endorsed, sponsored, or specifically approved by
          Supercell and Supercell is not responsible for it.
        </p>
        <p>© 2017 ClashCrown. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function DemoSearch() {
  return (
    <form className="search-box">
      <button type="button" className="search-type">
        Player Tag <ChevronDown size={13} />
      </button>
      <input aria-label="Player tag" placeholder="Enter Player Tag" defaultValue="" />
      <Link href="/players/CCDEMO" className="search-submit" aria-label="Search player">
        <Search size={27} />
      </Link>
    </form>
  );
}
