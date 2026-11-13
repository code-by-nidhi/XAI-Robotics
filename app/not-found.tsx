import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pg-hero pg-404">
      <div className="container pg-hero-inner">
        <p className="eyebrow">404</p>
        <h1 className="pg-hero-title">
          <span>Page not found</span>
        </h1>
        <p className="pg-hero-lede">The page you are looking for has moved, or never existed.</p>
        <Link href="/" className="btn btn-primary">
          Back to home <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
