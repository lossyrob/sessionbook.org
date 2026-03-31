import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "SessionBook is a home for Irish trad chord charts, sets, and session pages — built for guitarists and accompanists at the session.",
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <h1>About SessionBook</h1>

      <p>
        SessionBook started as a personal project — a way to write down chord
        progressions for Irish traditional tunes in a concise, readable format
        and share them with the people I play with. Other guitarists (and even
        some melody players) found the format useful, so I decided to put it on
        the web.
      </p>

      <h2>What it is today</h2>

      <p>
        Right now, SessionBook is a collection of tunes I&rsquo;ve worked
        through myself, with the chord choices I&rsquo;ve settled on. You can
        browse individual tunes, see how they&rsquo;re grouped into sets, and
        view full session pages with every chart laid out in playing order.
        Session pages can also be downloaded as PDFs for printing.
      </p>

      <h2>Where it&rsquo;s headed</h2>

      <p>
        The long-term goal is to make SessionBook a place where anyone can
        contribute chord charts, suggest sets of tunes that work well together,
        and build their own session pages — whether for a weekly pub session or
        a one-off gig. Think of it as a shared resource for the accompaniment
        side of Irish trad. The app may expand in other ways, depending on what
        the community finds useful!
      </p>

      <p>
        Development is happening{" "}
        <a
          href="https://github.com/robincornish/sessionbook"
          target="_blank"
          rel="noreferrer"
        >
          on GitHub
        </a>{" "}
        - submit issues if you have feature requests!
      </p>

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
