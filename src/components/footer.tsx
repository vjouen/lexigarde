import Link from "next/link";

export const AUTHOR = {
  name: "Valérian Jouen",
  email: "valejouen@gmail.com",
  github: "https://github.com/vjouen",
  linkedin: "https://www.linkedin.com/in/valerian-jouen/",
};

/** Pied de page commun à toutes les pages (landing + pages légales). */
export function Footer() {
  return (
    <footer className="no-print mx-auto w-full max-w-3xl px-4 pb-10">
      <div className="border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        <p>
          Créé par <span className="font-medium text-ink">{AUTHOR.name}</span> — projet
          portfolio cybersécurité &amp; GRC
        </p>
        <p className="mt-2 space-x-4">
          <a
            href={AUTHOR.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent hover:underline"
          >
            GitHub
          </a>
          <a
            href={AUTHOR.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent hover:underline"
          >
            LinkedIn
          </a>
        </p>
        <p className="mt-4 space-x-4 text-xs">
          <Link href="/a-propos" className="text-slate-500 hover:text-accent hover:underline">
            À propos
          </Link>
          <Link href="/mentions-legales" className="text-slate-500 hover:text-accent hover:underline">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="text-slate-500 hover:text-accent hover:underline">
            Politique de confidentialité
          </Link>
          <Link href="/cookies" className="text-slate-500 hover:text-accent hover:underline">
            Cookies
          </Link>
        </p>
      </div>
    </footer>
  );
}
