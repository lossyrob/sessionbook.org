"use client";

import Link from "next/link";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <div className="not-found">
      <p className="eyebrow">Catalog unavailable</p>
      <h1>SessionBook couldn&apos;t load the public catalog.</h1>
      <p className="lead">
        The homepage and browse indexes expect the Release 1 catalog to be
        available from the configured runtime source. Please try again or return
        to the homepage once the catalog connection is healthy.
      </p>
      <p className="data-note">
        {error.message}
      </p>
      <div className="action-row">
        <button className="action-button" onClick={() => reset()} type="button">
          Try again
        </button>
        <Link className="action-link" href="/">
          Return home
        </Link>
      </div>
    </div>
  );
}
