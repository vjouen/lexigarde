import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { AUTHOR } from "@/components/footer";

export const metadata: Metadata = {
  title: "Mentions légales — Lexigarde",
  description: "Identité de l'éditeur et de l'hébergeur du site lexigarde.fr.",
};

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" updated="12 juin 2026">
      <LegalSection title="Éditeur du site">
        <p>
          Le site lexigarde.fr est édité à titre personnel et non professionnel par{" "}
          <strong className="font-medium text-ink">{AUTHOR.name}</strong>, dans le cadre d&apos;un
          projet pédagogique de portfolio en cybersécurité et gouvernance, risques et conformité
          (GRC).
        </p>
        <p>
          Directeur de la publication : {AUTHOR.name}
          <br />
          Contact :{" "}
          <a href={`mailto:${AUTHOR.email}`} className="text-accent hover:underline">
            {AUTHOR.email}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Hébergeur">
        <p>
          Le site est hébergé par <strong className="font-medium text-ink">Vercel Inc.</strong>
          <br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
          <br />
          Site web :{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            vercel.com
          </a>
        </p>
        <p>
          Le nom de domaine lexigarde.fr est enregistré auprès d&apos;OVH SAS, 2 rue Kellermann,
          59100 Roubaix, France.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Le code source de Lexigarde est publié sous licence MIT et consultable sur{" "}
          <a
            href={AUTHOR.github + "/lexigarde"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            GitHub
          </a>
          . Les contenus rédactionnels du site sont la propriété de leur auteur.
        </p>
      </LegalSection>

      <LegalSection title="Nature du service">
        <p>
          Lexigarde est un outil de pré-diagnostic automatique fourni gratuitement, à titre
          pédagogique. Les rapports générés ne constituent ni un audit de conformité au sens
          réglementaire, ni un conseil juridique. L&apos;éditeur ne saurait être tenu responsable
          des décisions prises sur la seule base des rapports produits par l&apos;outil.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
