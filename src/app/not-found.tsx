import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">Not found</p>
      <h1>There isn&apos;t anything here yet.</h1>
      <p className="lead" style={{ margin: "0 auto" }}>
        Some routes are still in progress and will land in future issues.
      </p>
      <p className="back-link">
        <Link href="/">← Back to SessionBook</Link>
      </p>
    </div>
  );
}
