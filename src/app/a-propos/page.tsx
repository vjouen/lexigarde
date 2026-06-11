import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { AUTHOR } from "@/components/footer";

export const metadata: Metadata = {
  title: "Derrière Lexigarde — le projet et son auteur",
  description:
    "Pourquoi Lexigarde existe, comment fonctionne sa méthodologie d'analyse, et qui l'a conçu.",
};

const OBJECTIFS = [
  "Donner en 30 secondes un état des lieux fondé sur les textes : chaque constat cite l'article ou la recommandation qui le justifie",
  "Parler le langage de ceux qui décident : une synthèse claire, des risques concrets, un plan d'action priorisé",
  "Être honnête sur les limites : ce que l'outil ne peut pas vérifier, il le dit plutôt que de l'affirmer",
];

const PRINCIPES = [
  {
    titre: "Transparence",
    texte: "Le code est public, la méthodologie est documentée, les limites sont assumées dans chaque rapport.",
  },
  {
    titre: "Pédagogie",
    texte: "Pas de jargon gratuit : chaque problème est expliqué avec son risque réel et son fondement juridique.",
  },
  {
    titre: "Sobriété",
    texte: "Aucun compte, aucun traceur, aucune donnée conservée. L'outil applique à lui-même ce qu'il vérifie chez les autres.",
  },
];

export default function APropos() {
  return (
    <LegalLayout title="Derrière Lexigarde">
      <LegalSection title="L'origine">
        <p>
          Lexigarde est né d&apos;un constat simple : la conformité RGPD reste opaque pour la
          plupart des dirigeants de petites structures. Les rapports d&apos;audit parlent aux
          juristes, rarement à ceux qui doivent décider. Entre l&apos;article de loi brut et la
          plateforme d&apos;audit à plusieurs milliers d&apos;euros par an, il manquait un premier
          pas : un diagnostic gratuit, immédiat, et compréhensible sans expertise.
        </p>
        <p>
          Ce projet explore cette voie : un scan automatique honnête sur ses limites, où chaque
          constat cite son fondement juridique, et une synthèse rédigée pour être comprise sans
          bagage technique.
        </p>
      </LegalSection>

      <LegalSection title="L'objectif">
        <ul className="space-y-3">
          {OBJECTIFS.map((o, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Trois principes">
        <div className="grid gap-4 sm:grid-cols-3">
          {PRINCIPES.map((p) => (
            <div key={p.titre} className="rounded-xl border border-slate-200 bg-paper p-5">
              <h3 className="font-semibold text-ink">{p.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.texte}</p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="L'auteur">
        <div className="rounded-xl border border-slate-200 bg-paper p-6">
          <div className="flex items-center gap-4">
            <Image
              src="/valerian-jouen.jpg"
              alt={`Portrait de ${AUTHOR.name}`}
              width={160}
              height={160}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
            <div>
              <p className="font-semibold text-ink">{AUTHOR.name}</p>
              <p className="text-sm text-slate-500">Concepteur de Lexigarde</p>
            </div>
          </div>
          <p className="mt-4">
            Je suis <span className="font-medium text-ink">{AUTHOR.name}</span>, en reconversion
            vers la cybersécurité et la GRC après un master en sciences sociales et
            criminologie. Certifié CompTIA Security+, formé aux référentiels ANSSI
            (SecNumacadémie), CNIL (RGPD) et EBIOS RM, j&apos;ai conçu Lexigarde pour mettre
            cette double culture, juridique et technique, au service d&apos;un outil concret.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={AUTHOR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-deep"
            >
              Voir mon profil LinkedIn
            </a>
            <a
              href={AUTHOR.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 bg-paper px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Le code sur GitHub
            </a>
          </div>
        </div>
      </LegalSection>

      <div className="rounded-xl bg-blue-50/60 p-6 text-center">
        <p className="text-sm text-slate-700">
          La meilleure façon de comprendre Lexigarde, c&apos;est de l&apos;essayer.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-deep"
        >
          Analyser votre site gratuitement
        </Link>
      </div>
    </LegalLayout>
  );
}
