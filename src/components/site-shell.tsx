import Link from "next/link";
import type { ReactNode } from "react";

import { ownerSections, publicSections } from "@/lib/site-navigation";

type SiteShellProps = {
  children: ReactNode;
};

const headerLinks = [...publicSections, ownerSections[0]];

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <div>
            <Link className="site-logo" href="/">
              SessionBook
            </Link>
            <p className="site-tagline">A home for Irish trad chord charts.</p>
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
        <p>Release 1 bootstrap in progress. The catalog, search, auth, and private gig flows arrive in later issues.</p>
      </footer>
    </div>
  );
}
