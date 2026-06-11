import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Cookies — Lexigarde",
  description: "Politique cookies de lexigarde.fr : aucun traceur soumis à consentement n'est utilisé.",
};

export default function Cookies() {
  return (
    <LegalLayout title="Cookies et traceurs" updated="12 juin 2026">
      <LegalSection title="La réponse courte">
        <p>
          <strong className="font-medium text-ink">
            Lexigarde ne dépose aucun cookie ni traceur soumis à consentement.
          </strong>{" "}
          Pas de mesure d&apos;audience, pas de pixel publicitaire, pas de réseau social embarqué,
          pas d&apos;empreinte numérique (fingerprinting).
        </p>
      </LegalSection>

      <LegalSection title="Pourquoi il n'y a pas de bandeau cookies">
        <p>
          Les lignes directrices de la CNIL (délibération n° 2020-091 du 17 septembre 2020) ne
          rendent le recueil du consentement obligatoire que lorsque des traceurs non strictement
          nécessaires au service sont utilisés. Ce n&apos;est pas le cas ici : afficher un bandeau
          sur ce site serait donc inutile, et contraire à l&apos;esprit de la réglementation qui
          vise à réserver cette sollicitation aux cas où elle a un sens.
        </p>
        <p>
          C&apos;est d&apos;ailleurs l&apos;un des points que Lexigarde vérifie sur les sites
          analysés : un bandeau n&apos;est ni un gage de conformité, ni une obligation
          universelle. Ce qui compte, c&apos;est la cohérence entre les traceurs réellement
          déposés et l&apos;information donnée aux visiteurs.
        </p>
      </LegalSection>

      <LegalSection title="Inventaire des traceurs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left">
                <th className="py-2 pr-4 font-medium text-ink">Catégorie</th>
                <th className="py-2 pr-4 font-medium text-ink">Traceurs utilisés</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4">Strictement nécessaires</td>
                <td className="py-2 pr-4">Aucun</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4">Mesure d&apos;audience</td>
                <td className="py-2 pr-4">Aucun</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4">Publicité et réseaux sociaux</td>
                <td className="py-2 pr-4">Aucun</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Si l&apos;évolution du service venait à introduire des traceurs (par exemple une mesure
          d&apos;audience), cette page serait mise à jour et un mécanisme de consentement
          conforme serait mis en place avant tout dépôt.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
