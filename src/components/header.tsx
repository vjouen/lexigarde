"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
];

/** Barre de navigation commune : marque à gauche, liens à droite. */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="no-print border-b border-slate-200 bg-paper">
      <nav
        className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4"
        aria-label="Navigation principale"
      >
        <Link href="/" className="flex items-center gap-2 text-ink transition hover:opacity-80">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-accent"
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

        <div className="flex items-center gap-6">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-sm font-medium text-accent"
                    : "text-sm font-medium text-slate-600 transition hover:text-accent"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
