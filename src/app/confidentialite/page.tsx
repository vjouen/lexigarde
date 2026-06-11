import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { AUTHOR } from "@/components/footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Lexigarde",
  description:
    "Traitements de données personnelles réalisés par lexigarde.fr : finalités, bases légales, durées de conservation et droits.",
};

const TRAITEMENTS = [
  {
    nom: "Analyse d'un site web",
    donnees: "URL saisie, contenu public de la page analysée",
    finalite: "Réaliser le diagnostic de conformité demandé",
    base: "Intérêt légitime (fourniture du service demandé par l'utilisateur)",
    conservation: "Traitement en mémoire le temps du scan, aucune conservation",
  },
  {
    nom: "Limitation de débit",
    donnees: "Adresse IP",
    finalite: "Prévenir les abus et protéger le service (sécurité)",
    base: "Intérêt légitime (sécurité du service)",
    conservation: "En mémoire uniquement, 24 heures maximum, jamais écrite sur disque",
  },
  {
    nom: "Génération de la synthèse",
    donnees: "Constats techniques du scan (incluant l'URL analysée)",
    finalite: "Produire la synthèse rédigée du rapport",
    base: "Intérêt légitime (fourniture du service demandé)",
    conservation:
      "Transmis à l'API Claude d'Anthropic (États-Unis), non utilisés pour l'entraînement des modèles, conservation temporaire limitée par Anthropic",
  },
  {
    nom: "Journaux d'hébergement",
    donnees: "Adresse IP, user-agent, pages consultées",
    finalite: "Fonctionnement et sécurité de l'infrastructure",
    base: "Intérêt légitime (sécurité de l'hébergement)",
    conservation: "Durée limitée, gérée par l'hébergeur Vercel",
  },
];

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité" updated="12 juin 2026">
      <LegalSection title="En résumé">
        <p>
          Lexigarde est conçu pour traiter le moins de données possible : pas de compte
          utilisateur, pas de newsletter, pas de cookie de suivi, pas de base de données. Les
          scans ne sont pas conservés. Le responsable du traitement est {AUTHOR.name},
          joignable à{" "}
          <a href={`mailto:${AUTHOR.email}`} className="text-accent hover:underline">
            {AUTHOR.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Les traitements réalisés">
        <div className="space-y-4">
          {TRAITEMENTS.map((t) => (
            <div key={t.nom} className="rounded-lg border border-slate-200 bg-paper p-4">
              <h3 className="font-medium text-ink">{t.nom}</h3>
              <dl className="mt-2 space-y-1">
                <div>
                  <dt className="inline font-medium text-slate-700">Données : </dt>
                  <dd className="inline">{t.donnees}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-700">Finalité : </dt>
                  <dd className="inline">{t.finalite}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-700">Base légale : </dt>
                  <dd className="inline">{t.base}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-700">Conservation : </dt>
                  <dd className="inline">{t.conservation}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="Transferts hors Union européenne">
        <p>
          Deux prestataires sont situés aux États-Unis : Vercel (hébergement) et Anthropic
          (génération de la synthèse via l&apos;API Claude). Ces transferts sont encadrés par les
          garanties contractuelles de ces prestataires (clauses contractuelles types de la
          Commission européenne). Aucune donnée n&apos;est transmise à d&apos;autres tiers, ni
          vendue, ni utilisée à des fins publicitaires.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD (articles 15 à 21), vous disposez d&apos;un droit d&apos;accès, de
          rectification, d&apos;effacement, de limitation et d&apos;opposition sur les données vous
          concernant. Compte tenu de l&apos;architecture du service (aucune donnée conservée),
          l&apos;exercice de ces droits portera essentiellement sur les journaux d&apos;hébergement.
        </p>
        <p>
          Pour exercer vos droits :{" "}
          <a href={`mailto:${AUTHOR.email}`} className="text-accent hover:underline">
            {AUTHOR.email}
          </a>
          . Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une
          réclamation à la CNIL (
          <a
            href="https://www.cnil.fr/fr/plaintes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            cnil.fr/fr/plaintes
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="Une précision sur les sites que vous analysez">
        <p>
          Lorsque vous soumettez une URL, Lexigarde consulte uniquement le contenu public de la
          page, comme le ferait un navigateur. L&apos;outil ne contourne aucune protection,
          n&apos;accède à aucun espace privé et ne conserve pas le contenu consulté après le scan.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
