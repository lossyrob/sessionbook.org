import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">Not found</p>
      <h1>There isn&apos;t anything here yet.</h1>
      <p className="lead">
        This bootstrap only sets up the Release 1 shell, so some routes will
        stay intentionally empty until their feature issues land.
      </p>
      <p className="back-link">
        <Link href="/">Return to SessionBook</Link>
      </p>
    </div>
  );
}
