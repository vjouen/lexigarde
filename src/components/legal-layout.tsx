import Link from "next/link";

/** Gabarit commun des pages légales : marque cliquable, titre, contenu. */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <header className="mb-10">
        <Link href="/" className="flex items-center gap-2 text-ink hover:opacity-80">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l7 4v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9V7l7-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">Lexigarde</span>
        </Link>
      </header>

      <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      {updated && <p className="mt-2 text-sm text-slate-500">Dernière mise à jour : {updated}</p>}

      <div className="mt-8 space-y-8">{children}</div>

      <p className="mt-12">
        <Link href="/" className="text-sm font-medium text-accent hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </main>
  );
}

/** Section titrée d'une page légale. */
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}
