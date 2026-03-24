import Link from "next/link";
import type { ReactNode } from "react";

import { ownerSections, publicSections } from "@/lib/site-navigation";

type SiteShellProps = {
  children: ReactNode;
};

const headerLinks = [...publicSections, ...ownerSections].filter(
  (section) => section.showInHeader,
);

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <Link className="site-logo" href="/">
              SessionBook
            </Link>
            <span className="site-tagline">Irish trad chord charts</span>
          </div>

          <nav aria-label="Primary">
            <ul className="site-nav">
              {headerLinks.map((section) => (
                <li key={section.href}>
                  <Link className="site-nav__link" href={section.href}>
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <p>SessionBook · Release 1 public catalog</p>
      </footer>
    </div>
  );
}
