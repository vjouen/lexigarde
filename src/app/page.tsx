"use client";

import { useState } from "react";
import Link from "next/link";
import type { ScanResult, Finding, Severity } from "@/lib/scan/types";

const REFERENTIELS = ["RGPD", "Recommandations CNIL", "Guides ANSSI", "LCEN"];

const STATS = [
  { value: "20+", label: "points de contrôle" },
  { value: "30 s", label: "pour un diagnostic" },
  { value: "0 €", label: "sans inscription" },
];

const PILLARS = [
  {
    title: "Mentions obligatoires",
    text: "Mentions légales, politique de confidentialité, information cookies, contact DPO : ce que la loi impose d'afficher.",
  },
  {
    title: "Sécurité technique",
    text: "HTTPS forcé, en-têtes de sécurité, protection des cookies : les mesures techniques exigées par l'article 32 du RGPD.",
  },
  {
    title: "Cookies et traceurs",
    text: "Traceurs publicitaires déposés sans consentement, bandeau cookies : le premier motif de sanction CNIL.",
  },
  {
    title: "Formulaires",
    text: "Collecte de données personnelles : information sur la finalité et recueil du consentement au bon moment.",
  },
];

const SEVERITY_STYLE: Record<
  Severity,
  { label: string; badge: string; border: string }
> = {
  critical: {
    label: "Critique",
    badge: "bg-red-100 text-red-800",
    border: "border-red-300",
  },
  warning: {
    label: "À corriger",
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-300",
  },
  info: {
    label: "À vérifier",
    badge: "bg-slate-200 text-slate-700",
    border: "border-slate-300",
  },
  pass: {
    label: "Conforme",
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200",
  },
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function scoreRing(score: number): string {
  if (score >= 80) return "stroke-emerald-500";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-red-500";
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-slate-200" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className={scoreRing(score)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-semibold ${scoreColor(score)}`}>{score}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const style = SEVERITY_STYLE[finding.severity];
  return (
    <div className={`print-block rounded-lg border ${style.border} bg-paper p-4`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-ink">{finding.title}</h4>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{finding.explanation}</p>
      {finding.recommendation && (
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-medium">Action : </span>
          {finding.recommendation}
        </p>
      )}
      {finding.evidence && (
        <p className="mt-2 truncate font-mono text-xs text-slate-400">{finding.evidence}</p>
      )}
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [summaryError, setSummaryError] = useState<string | null>(null);

  async function runScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || scanning) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setSummary(null);
    setSummaryStatus("idle");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Le scan a échoué.");
        return;
      }
      setResult(data);
      void fetchSummary(data);
    } catch {
      setError("Impossible de joindre le serveur. Réessayez.");
    } finally {
      setScanning(false);
    }
  }

  async function fetchSummary(scan: ScanResult) {
    setSummaryStatus("loading");
    setSummaryError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scan),
      });
      const data = await res.json();
      if (!res.ok) {
        setSummaryError(data.error ?? null);
        setSummaryStatus("error");
        return;
      }
      setSummary(data.summary);
      setSummaryStatus("idle");
    } catch {
      setSummaryStatus("error");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {/* Marque */}
      <header className="mb-12 flex items-center justify-center gap-2">
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
        <span className="text-xl font-semibold tracking-tight text-ink">Lexigarde</span>
      </header>

      {/* Hero */}
      {!result && (
        <section className="no-print mb-10 text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Votre site web est-il
            <br />
            <span className="text-accent">conforme au RGPD</span> ?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Entrez une URL, obtenez en 30 secondes un diagnostic clair : ce qui va, ce qui
            expose votre entreprise, et quoi corriger en priorité.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {REFERENTIELS.map((r) => (
              <span
                key={r}
                className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
              >
                {r}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Formulaire */}
      <form onSubmit={runScan} className="no-print mb-10 flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://votre-site.fr"
          className="flex-1 rounded-lg border border-slate-300 bg-paper px-4 py-3 text-ink placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-blue-100"
          aria-label="URL du site à analyser"
        />
        <button
          type="submit"
          disabled={scanning}
          className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {scanning ? "Analyse…" : "Analyser"}
        </button>
      </form>

      {/* Chiffres clés */}
      {!result && !scanning && (
        <section className="no-print mb-12 grid grid-cols-3 gap-4 border-y border-slate-200 py-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-semibold text-ink">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </section>
      )}

      {/* Erreur */}
      {error && (
        <div className="no-print mb-8 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div>
          {/* Score global */}
          <section className="print-block mb-8 flex items-center gap-6 rounded-xl border border-slate-200 bg-paper p-6">
            <ScoreCircle score={result.globalScore} />
            <div>
              <h2 className="text-lg font-semibold text-ink">Score de conformité</h2>
              <p className="mt-1 break-all text-sm text-slate-500">{result.finalUrl}</p>
              <p className="text-xs text-slate-400">
                Analysé le {new Date(result.scannedAt).toLocaleString("fr-FR")}
              </p>
              <button
                onClick={() => window.print()}
                className="no-print mt-3 rounded-md border border-slate-300 bg-paper px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Exporter en PDF
              </button>
            </div>
          </section>

          {/* Synthèse IA */}
          <section className="print-block mb-8 rounded-xl border border-blue-100 bg-blue-50/40 p-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">Synthèse pour la direction</h2>
            {summary && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {summary}
              </div>
            )}
            {summaryStatus === "loading" && (
              <p className="animate-pulse text-sm text-slate-500">
                Rédaction de la synthèse en cours…
              </p>
            )}
            {summaryStatus === "error" && (
              <p className="text-sm text-slate-500">
                {summaryError ??
                  "Synthèse indisponible pour le moment. Les constats détaillés ci-dessous restent complets."}
              </p>
            )}
          </section>

          {/* Blocs de constats */}
          {result.blocks.map((block) => (
            <section key={block.id} className="mb-8">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-ink">{block.label}</h3>
                <span className={`text-xl font-semibold ${scoreColor(block.score)}`}>
                  {block.score}/100
                </span>
              </div>
              <div className="space-y-3">
                {block.findings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))}
              </div>
            </section>
          ))}

          <p className="mt-10 text-center text-xs text-slate-400">
            Lexigarde analyse la page d&apos;accueil et ses en-têtes HTTP. Ce rapport est un
            premier diagnostic automatique, il ne remplace pas un audit de conformité complet.
          </p>

          <div className="no-print mt-8 text-center">
            <button
              onClick={() => {
                setResult(null);
                setSummary(null);
                setError(null);
                setUrl("");
                window.scrollTo({ top: 0 });
              }}
              className="text-sm font-medium text-accent hover:underline"
            >
              ← Analyser un autre site
            </button>
          </div>
        </div>
      )}

      {/* Vitrine */}
      {!result && !scanning && (
        <div className="no-print">
          <h2 className="mb-4 text-center text-2xl font-semibold tracking-tight text-ink">
            Ce que Lexigarde vérifie
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-xl border border-slate-200 bg-paper p-5">
                <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-slate-600">
            Chaque constat cite son fondement juridique et propose une action corrective
            concrète. Une synthèse en langage clair, pensée pour la direction, est générée pour
            chaque rapport. Aucune donnée n&apos;est conservée.{" "}
            <Link href="/a-propos" className="font-medium text-accent hover:underline">
              Découvrir le projet et son auteur →
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
