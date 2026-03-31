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
        and share them with the people I play with. Other guitarists and
        bouzouki players (and even some melody players) found the format useful,
        so I decided to put it on the web.
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
        side of Irish trad.
      </p>

      <h2>
        Relationship to{" "}
        <a href="https://thesession.org" target="_blank" rel="noreferrer">
          thesession.org
        </a>
      </h2>

      <p>
        <a href="https://thesession.org" target="_blank" rel="noreferrer">
          The Session
        </a>{" "}
        is an incredible community resource for Irish traditional music. It
        focuses primarily on melody — sheet music, ABC notation, tune
        discussions, and session listings. SessionBook isn&rsquo;t trying to
        replace any of that. It&rsquo;s a complementary project focused on chord
        charts and accompaniment. Where relevant, tune pages link back to The
        Session so you can find recordings, discussions, and notation for the
        same tunes.
      </p>

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
