# Verdiq — Audit RGPD express de sites web

> Entrez une URL, obtenez en 30 secondes un rapport de conformité RGPD : score global, constats détaillés avec leur fondement juridique, et une synthèse en langage clair générée par IA pour la direction.

**Projet portfolio cybersécurité / GRC** — conçu et développé par [Valérian Jouen](https://www.linkedin.com/in/valerian-jouen/), candidat en reconversion vers les métiers de la GRC (CompTIA Security+, SecNumacadémie ANSSI, RGPD CNIL, EBIOS RM).

---

## Ce que fait Verdiq

L'outil scanne la page d'accueil d'un site et évalue **4 blocs de conformité**, chacun noté sur 100 :

| Bloc | Ce qui est vérifié | Fondements |
|------|--------------------|------------|
| **Mentions obligatoires** | Mentions légales, politique de confidentialité, information cookies, référence DPO | LCEN art. 6-III, RGPD art. 13/14/37 |
| **Sécurité technique** | Redirection HTTPS, headers (HSTS, CSP, X-Frame-Options, Referrer-Policy…), attributs des cookies | RGPD art. 32, guides ANSSI, OWASP |
| **Cookies et traceurs** | Cookies de tracking déposés avant consentement, scripts tiers (GA, Meta Pixel…), détection de CMP | Art. 82 loi Informatique et Libertés, délibérations CNIL 2020-091/092 |
| **Formulaires** | Champs collectant des données personnelles, information sur la finalité, case de consentement | RGPD art. 6, 7 et 13 |

Chaque constat indique : le problème, **le risque concret** (sanction encourue, exemple de jurisprudence CNIL), et **l'action corrective**. Une synthèse de 250 mots maximum (verdict / risques prioritaires / plan d'action), pensée pour un dirigeant non technique, est ensuite générée par Claude (Anthropic).

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Interface (formulaire, scores, constats, synthèse)
│   └── api/
│       ├── scan/route.ts         # POST /api/scan — moteur de scan
│       └── report/route.ts       # POST /api/report — synthèse IA
└── lib/
    ├── scan/
    │   ├── url-guard.ts          # Validation d'URL + garde anti-SSRF
    │   ├── fetcher.ts            # Récupération page + headers, test HTTP→HTTPS
    │   ├── checks/               # Les 4 blocs de checks
    │   ├── score.ts              # Scoring pondéré (cookies pèsent plus lourd)
    │   └── run.ts                # Orchestrateur
    ├── report/generate.ts        # Appel Claude API (prompt système structuré + cache)
    └── rate-limit.ts             # Limitation de débit par IP
```

## Choix de sécurité

Un scanner d'URLs côté serveur est lui-même une surface d'attaque. Mesures prises :

- **Garde anti-SSRF** ([url-guard.ts](src/lib/scan/url-guard.ts)) : rejet des adresses localhost, IP privées (RFC 1918), link-local (dont métadonnées cloud 169.254.169.254), CGNAT, et résolution DNS préalable pour bloquer les hostnames publics pointant vers des IP internes (DNS rebinding basique)
- **Rate limiting par IP** : 30 scans et 5 synthèses IA par jour, pour protéger le budget API contre les scans en masse
- **Timeouts et plafonds** : 15 s par requête sortante, HTML tronqué à 3 Mo
- **Secrets hors du code** : clé API en variable d'environnement, jamais commitée
- **Pages d'erreur non analysées** : les réponses HTTP ≥ 400 (sites bloquant les robots) sont rejetées proprement au lieu de produire un score mensonger

## Limites assumées (v1)

- Scan **sans navigateur headless** : les cookies déposés dynamiquement en JavaScript et les contenus injectés côté client ne sont pas visibles. L'outil le signale explicitement dans ses constats plutôt que d'affirmer une conformité qu'il ne peut pas vérifier
- Seule la **page d'accueil** est analysée
- Le rate limiting est en mémoire (par instance serverless) — un store partagé type Upstash est prévu si le trafic le justifie
- Ce rapport est un **premier diagnostic**, pas un audit de conformité au sens propre

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · cheerio · SDK Anthropic (Claude Opus 4.8, prompt système mis en cache) · Vercel

## Lancer en local

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local   # optionnel : sans clé, le scan fonctionne, seule la synthèse IA est désactivée
npm run dev
```

## Pistes v2

- Scan multi-pages (mentions légales et politique de confidentialité suivies et analysées)
- Navigateur headless pour les cookies déposés en JavaScript
- Module NIS2 pour les PME concernées
- Historique des scans et suivi de la remédiation

---

*Verdiq est un projet pédagogique et un outil de pré-diagnostic. Il ne constitue pas un conseil juridique.*
