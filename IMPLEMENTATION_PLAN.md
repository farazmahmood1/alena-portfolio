# Implementation plan — Codilated SEO & AIEO content update

Source brief: `CODILATED_WEBSITE_FINAL (1).md` (v1.4). This plan maps each section of the brief to the files in this repository.

## 1. What the repository actually is

The brief assumes a MERN app (React + Express + MongoDB). This repository is not that: it is a **static HTML site** exported from a WordPress/Semplice theme and deployed to Hostinger over FTP (`.github/workflows/deploy-hostinger.yml`). There is no React, no build step and no Node server.

| Brief assumption | Reality | How the plan adapts |
|-|-|-|
| React SPA rendering into `#root` | Every page is a full static `.html` file with all its text in the markup | Section 2.1 is already met. The plan verifies it with `curl` and changes nothing |
| `react-helmet-async` / Next Metadata | `<head>` tags are written directly in each HTML file | Edit the `<head>` of each file |
| Express + MongoDB backend | None | Add a standalone Express + Mongoose API in `server/`, deployed separately (Hostinger Node.js app, VPS, Render…) because FTP hosting can't run Node. The front end posts to it |
| `VITE_GA_MEASUREMENT_ID` | No build-time env | `assets/site-config.js` holds `gaMeasurementId` and `apiBase`. `scripts/write-site-config.mjs` generates it from env vars (`GA_MEASUREMENT_ID`, `API_BASE`), and the deploy workflow runs it before uploading |
| Brief routes `/about-us`, `/contact-us`, `/branding`, … | Existing routes are `/about`, `/contact`, `/services/branding-design`, … (clean URLs via `.htaccess`) | **Keep the existing URLs** (brief rule: "Don't change any existing route"). Canonicals, schema, sitemap and llms.txt use the real URLs. The brief's paths get 301 redirects to the real pages so links written from the brief still work |

### Page mapping

| Brief page | Brief path | Existing file | Live URL (canonical) |
|-|-|-|-|
| Home (§4) | `/` | `index.html` | `https://codilated.com/` |
| About (§5) | `/about-us` | `about.html` | `https://codilated.com/about` |
| Contact (§6) | `/contact-us` | `contact.html` | `https://codilated.com/contact` |
| Branding (§7) | `/branding` | `services/branding-design.html` | `https://codilated.com/services/branding-design` |
| Shopify (§8) | `/shopify-brand-development` | `services/shopify-ecommerce.html` | `https://codilated.com/services/shopify-ecommerce` |
| Website & app (§9) | `/custom-website-app-development` | `services/web-development.html` | `https://codilated.com/services/web-development` |
| AI automation (§10) | `/ai-automation` | `services/ai-automation.html` | `https://codilated.com/services/ai-automation` |
| Work (llms.txt) | `/work` | `portfolio/index.html` | `https://codilated.com/portfolio/` |

## 2. Before screenshots

Taken at 1440px and 390px wide for 12 pages. They are kept outside the repo, in the session scratchpad. Full-page capture hangs on this theme (Lenis smooth scroll), so each page is captured as scrolled viewport tiles and stitched into one image.

## 3. Phases

### Phase A — Crawlable HTML (§2.1)
Already met because the pages are static. Verify with `curl` against a local server: the headline, body copy, FAQ text and JSON-LD must all be in the raw HTML.

### Phase B — Head tags and JSON-LD (§2.3, per-page JSON-LD, §11.1)
- **Brief pages (7):** set the exact title, meta description, OG title and description, twitter title and description, canonical and `og:url` from the brief.
- **All pages (55):** point `og:image` and `twitter:image` to the new `/og-image.png`, and replace the `Organization` node in the existing JSON-LD `@graph` with the §11.1 `ProfessionalService` node (same `@id`). Other nodes (WebSite, WebPage, BlogPosting) stay.
- **Home:** keep the `WebSite` node, which already exists.
- **About:** `AboutPage` whose `mainEntity` is the org `@id`, plus legalName, address, foundingDate and founder, as §5.14 specifies.
- **Contact:** `ContactPage` with `mainEntity` holding the contactPoint and hours (§6.7), plus a `FAQPage` built from the FAQ text visible on the page.
- **Service pages (4):** `Service` (no offers, no prices) and `BreadcrumbList` (§7.13, §8.12, §9.13, §10.16).
- **FAQPage only where a FAQ is visible.** Only the Contact page has a FAQ component. The Home, About and four service pages have no FAQ element, so their FAQs are skipped (see §5) and they get no FAQPage schema, because schema must match what's visible.
- **New `/og-image.png`:** 1200×630, current logo, the line "We Build Shopify Brands From Scratch to Sales", brand colours (`#fe2a00` fire red, `#0b0b0b` black, `#f5f5f6` off-white). Rendered from HTML with the headless browser.

### Phase C — Copy (§3–§10)
Every change is a text replacement inside an existing element. Scripted replacements assert that each target string occurs exactly the expected number of times, so markup, classes and attributes stay byte-for-byte identical. Where the brief has fewer items than a list has slots, the leftover slots keep their current text. Where it has more, the extra items are skipped and reported.

**Global (all 55 pages)**
- Header CTA `Let's talk` → `Book a free strategy call`, linking to Calendly (§3.1).
- Footer:
  - Services column (5 slots): the first 5 of the 8 brief items.
  - Company column (5 slots): About Codilated · How We Work · Work · Blog · Contact.
  - Bottom-left contact block (4 lines): Codilated LLC, St. Petersburg, Florida, USA / Registered address … / email / phone.
  - Year line: © 2026 Codilated LLC., kept current by `site.js`. `All rights reserved.`
  - Social links: LinkedIn and Instagram already correct. GitHub and X are reported, not removed.
  - Also add the missing `href`s on the home footer links (they only had `data-mce-href`).
- Footer blurb: no slot, so it is skipped.
- Ticker (home only): `From scratch to sales — brand, Shopify, software, AI —`.
- Remove the German random-headline script (`begriffe`) that overwrites the English "letswork" CTA heading on 31 pages. Pages then show their own static heading.
- `15+ years` → `7+ years`, and `Founded 2010` / `Since 2010` → 2019, everywhere (the brief's facts).
- Remove the leftover Google tag `GT-K5Q7LWTH` template scripts from the old WordPress site (they aren't Codilated's; GA4 now loads through `site.js`).

**Home (`index.html`)**

| Brief | Slot |
|-|-|
| 4.1 main headline | H1, 3 lines: `We Build Shopify` / `Brands From` / `Scratch to Sales` |
| 4.1 subheadline | hero `<p>`, keeping its strong / text / strong pattern |
| 4.1 primary button | hero button → `Book a free strategy call` (Calendly) |
| 4.1 label, secondary button, microcopy | no slot, skipped |
| 4.3 focus strip | "Built to ship" section H2 and bold line |
| 4.2 intro paragraph | "Built to ship" section body `<p>` |
| 4.10 label and title | "OUR WORK" kicker and H2 |
| 4.10 case studies | first two work tiles (title, services, image alt). Nur by Juggun links to its live site. Juggun's Organics links to the branding service page (it has no page of its own) |
| 4.11 title, intro, founder quote | "Hi, we're Codilated" card H2, bold line, paragraph, quote line |
| 4.4 stats | the card's 3 animated counters: 7+ Years in business · 124+ Projects shipped · 30+ Brands launched from scratch (values set in the counter script) |
| 4.9 process | 3 process steps (H2 question, H3 name, body) |
| 4.5 label, title, intro | "Services" kicker, H2, bold/intro `<p>`. The H3 link line becomes the three service names |
| 4.14 blog | Blog H2 and intro |
| 4.6, 4.7, 4.8, 4.12 FAQ, 4.13 final CTA, 4.4 logo label, 4.9 label/title, 4.11 five reasons | no slot, skipped |

**About (`about.html`)**

| Brief | Slot |
|-|-|
| 5.1 headline and subheadline | H1 (3 lines) and hero `<p>` |
| 5.9 by the numbers | "The short version" fact strip (✧ list), rebuilt from brief facts only |
| 5.2 Who we are | first meme section H2 and `<p>` |
| 5.3 Our story | second meme section H2 and `<p>` |
| 5.4 and 5.5 Mission, Vision | third meme section H2 and `<p>` |
| 5.6 What we believe | fourth meme section H2 and its two `<p>`s |
| 4.5 services, with the lists from 4.6, 4.7, 4.8 | "Capabilities" accordion (3 items × 5 sub-items): Shopify Brand Building · Custom Software & App Development · AI Automation |
| 5.13 final CTA | CTA block H2, `<p>` and button (Calendly) |
| 5.7, 5.8, 5.10, 5.11, 5.12 FAQ, second CTA button | no slot, skipped |

**Contact (`contact.html`)**

| Brief | Slot |
|-|-|
| 6.1 headline | the H1 repeated on each of the 3 form steps |
| 6.1 subheadline | step-1 intro `<p>` |
| 6.4 form title, placeholder, submit label | form H2 (step 1), message placeholder, submit button |
| 6.4 success and error messages | shown through Quform's own message components |
| 6.6 FAQ | first 4 of the 6 FAQ slots. Slots 5–6 keep their current Q&A |
| 6.2, 6.3, 6.5, text under the button | no slot, skipped. The registered address appears in the footer on this page |

**Service pages (4):** hero H1 (3 lines), hero `<p>`, hero button (Calendly), intro section (kicker, H2, two `<p>`s), the 12-card "What we build" grid, the "Why …" section, and the "Before you click away" CTA (H3, `<p>`, button). The detailed slot tables are in the report. Where a card grid has more slots than the brief has items, cards are matched by role (e.g. Packaging → Packaging card) and unmatched cards keep their text.

**Legal pages:** name the company Codilated LLC, a Florida limited liability company, with the registered address. Legal Notice "Business registration" California → Florida.

### Phase D — Contact form backend (§2.4)
- `server/`: Express, Mongoose `Lead` model, zod validation, `express-rate-limit` (5 requests per 15 minutes per IP), helmet, CORS (`CORS_ORIGIN`), and nodemailer notification to `CONTACT_NOTIFY_EMAIL`. The lead is saved before the email is sent. Errors are generic, with no stack traces.
- Front end: `site.js` overrides the Quform `submit` prototype on the contact form.
  - Steps 1–2 are validated and paged client-side.
  - The last step POSTs JSON to `${apiBase}/api/contact`.
  - The request includes sourcePage, UTM fields and the existing Quform honeypot `quform_4_0`, which is already hidden.
  - Quform's own success, error and field-error components are reused, and `generate_lead` fires on success.

### Phase E — robots.txt, sitemap.xml, llms.txt, analytics (§2.5, §11)
- `robots.txt`: exactly as §11.2.
- `sitemap.xml`: generated by `scripts/generate-sitemap.mjs` from the HTML files, with `lastmod` taken from the git log. It excludes `404`.
- `llms.txt`: §11.4 with the real URLs, plus a `text/plain` content type in `.htaccess`, `vercel.json` and `netlify.toml`.
- GA4 is loaded by `site.js` only when `gaMeasurementId` is set, after `load` and in idle time.
- Delegated click events: `whatsapp_click`, `book_call_click`, `email_click`. `generate_lead` fires on form success.

## 4. Verification after each phase
- No build, linter or tests exist for the static site. Checks:
  - `node --check` on the JS files.
  - JSON-LD blocks parse.
  - HTML tag-count diff per page, which must be identical except for the removed scripts and the anchors noted.
  - A text diff.
  - `server/` gets its own tests (`node --test`) with an in-memory MongoDB.
- After screenshots use the same tiling script and are compared against the before set.
- One commit per phase.

## 5. Copy with no matching place in the UI (skipped)

Listed in full in the final report. The largest gaps:
- all FAQ blocks except Contact
- Home §4.6–4.8
- About founder bio, Where we work, How we work with you
- the service pages' packages tables, process lists, industries, tech stack, "what you receive" and final-CTA second buttons
- Contact §6.2, §6.3, §6.5
