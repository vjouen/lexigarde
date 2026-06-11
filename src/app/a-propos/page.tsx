import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { AUTHOR } from "@/components/footer";

export const metadata: Metadata = {
  title: "Derrière Lexigarde — le projet et son auteur",
  description:
    "Pourquoi Lexigarde existe, comment fonctionne sa méthodologie d'analyse, et qui l'a conçu.",
};

export default function APropos() {
  return (
    <LegalLayout title="Derrière Lexigarde">
      <LegalSection title="Le projet">
        <p>
          Lexigarde est né d&apos;un constat simple : la conformité RGPD reste opaque pour la
          plupart des dirigeants de petites structures. Les rapports d&apos;audit parlent aux
          juristes, rarement à ceux qui doivent décider. Ce projet explore une autre voie : un
          diagnostic automatique honnête sur ses limites, où chaque constat cite son fondement
          juridique, et une synthèse rédigée pour être comprise sans expertise technique.
        </p>
      </LegalSection>

      <LegalSection title="La méthodologie">
        <p>
          La méthodologie est ouverte : les contrôles s&apos;appuient sur les textes (RGPD, LCEN,
          lignes directrices CNIL, guides ANSSI), le scoring est pondéré selon les risques de
          sanction réels, et tout le code est consultable publiquement. Ce que l&apos;outil ne
          peut pas vérifier, il le dit, plutôt que de l&apos;affirmer.
        </p>
      </LegalSection>

      <LegalSection title="L'auteur">
        <p>
          Je suis <span className="font-medium text-ink">{AUTHOR.name}</span>, en reconversion
          vers la cybersécurité et la GRC après un master en sciences sociales et criminologie.
          Certifié CompTIA Security+, formé aux référentiels ANSSI (SecNumacadémie), CNIL (RGPD)
          et EBIOS RM, j&apos;ai conçu Lexigarde pour mettre cette double culture, juridique et
          technique, au service d&apos;un outil concret.
        </p>
      </LegalSection>

      <div className="flex flex-wrap items-center gap-3 pt-2">
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
    </LegalLayout>
  );
}
