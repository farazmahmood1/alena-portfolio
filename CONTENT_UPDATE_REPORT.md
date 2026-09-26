# Codilated content & SEO update — final report

Brief: `CODILATED_WEBSITE_FINAL (1).md` v1.4 · Completed 26 September 2026 · Plan: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

## 1. Summary

The brief assumed a MERN app. This repository is a **static HTML site** (a Semplice/WordPress export) deployed to Hostinger over FTP. Every phase was adapted to that; see the plan, section 1. Commits, one per phase:

| Commit | Phase |
|-|-|
| `1cc2f0e` | Plan. Phase A (crawlable HTML) needed no change: every page is already static HTML with its full text in the markup |
| `18eb84b` | B — head tags, entity JSON-LD, new `/og-image.png` |
| `f967c37` | C — copy on the header, footer, Home, About, Contact, four service pages, Work and legal pages |
| `dc047d3` | D — contact API (`server/`) and form wiring, plus analytics hooks in `site.js` |
| `d1b3ea3` | E — robots.txt, llms.txt, sitemap generator, redirects, deploy workflow |
| `e19761d`, `ce00469` | Fixes: decorative icon alt text; a mobile wrap on Home |

**URLs were kept** (brief rule). The brief's paths redirect with a 301 to the live pages, and canonicals, schema, sitemap and llms.txt use the live URLs:

| Brief path | Redirects to |
|-|-|
| `/about-us` | `/about` |
| `/contact-us` | `/contact` |
| `/branding` | `/services/branding-design` |
| `/shopify-brand-development` | `/services/shopify-ecommerce` |
| `/custom-website-app-development` | `/services/web-development` |
| `/ai-automation` | `/services/ai-automation` |
| `/work` | `/portfolio/` |

**The UI is unchanged.** A script compares every page's body element tree (tag, class, style, id) with the original. It is identical on all 55 pages, apart from two dead `href="#"` links ("companies", "founders") in the Home "why" paragraph, whose words are no longer in the copy. Before and after screenshots at 1440px and 390px were compared page by page.

## 2. What changed

**Head and schema (all 55 pages)**
- The Organization node is now the §11.1 `ProfessionalService` entity: legal name, registered address, founder, focus markets, services, no prices.
- `og:image` and `twitter:image` point to `/og-image.png`, a new 1200×630 image with the logo, "We Build Shopify Brands From Scratch to Sales" and the brand red and black.
- The seven brief pages carry the exact titles, descriptions, OG and Twitter tags from the brief.
- About has `AboutPage` plus the founder's short bio.
- Contact has `ContactPage`, a `ContactPoint` with hours, and a `FAQPage` built from the visible FAQ.
- Service pages have `Service` and `BreadcrumbList` nodes, with no `offers`.
- The old site's Google tag (`GT-K5Q7LWTH`, not Codilated's) was removed.

**Copy**
- **Header CTA:** "Free call", linking to Calendly.
- **Footer:**
  - Services and Company columns
  - contact block with the registered address
  - "© 2026 Codilated LLC. / All rights reserved.", year kept current by script
  - ticker
- **Pages:** Home, About, Contact, Branding, Shopify, Website & App and AI Automation, slot by slot.
- **Work tiles:** Nur by Juggun (links to nurbyjuggun.com) and Juggun's Organics (links to the branding page, since it has no page of its own) fill the first two tiles on Home and Work.
- **Stat counters:** 7+ years, 124+ projects, 30+ brands.
- **Legal pages:**
  - Codilated LLC, Florida, with the registered address
  - Legal Notice said "California"
- **Site-wide fact fixes:**
  - "15+ years" → "7+ years"
  - "Founded 2010" / "Since 2010" → 2019
  - a stray porsche.com link on About now points to Work
  - a German random-headline script that overwrote the English CTA heading on 31 pages was disabled
  - the theme's German `site_name` was set to "Codilated"
- **Accessibility:** descriptive alt text replaced German or placeholder alts, and decorative icons got `alt=""`.

**Contact form** (the form previously failed at every step with "Ajax error", because it posted to a WordPress endpoint that no longer exists)
- **`server/`:** Express, Mongoose `Lead`, zod validation, 5 requests / 15 min rate limit, helmet, CORS allow-list, honeypot. The notification email is sent after the lead is saved, so a failed email is recorded on the lead, never lost. No stack traces reach the client. 13 tests pass, including one against a real in-memory MongoDB.
- **Front end:**
  - each step is validated in the browser, including the form's own rule that phone is required only for a phone call
  - the last step POSTs to the API
  - results appear in Quform's own error and success components with the brief's wording
  - `generate_lead` fires on success
  - UTM tags are carried from the landing page
- **Checked end to end in a browser** against a local API and MongoDB:
  - validation errors
  - Back/Next
  - conditional fields
  - lead stored with UTM data
  - email sent
  - success message
  - error message when the API is down

**Analytics:** GA4 loads only when a measurement ID is configured, after `load` and in idle time. `whatsapp_click`, `book_call_click` and `email_click` are tracked with a click listener that catches clicks on any matching link.

## 3. Copy the UI had no place for (skipped)

- **Global:**
  - footer blurb
  - Services column items 6–8 (Web & Mobile Apps · AI Automation · AI Chatbots & Voice Agents)
  - contact line "Working with clients worldwide, with a focus on the UAE, USA and Pakistan."
  - no WhatsApp links exist, so none were changed or added
- **Home:**
  - 4.1 label, secondary button, microcopy
  - 4.4 logo-strip label, and stats 4–5 (96% retention, Worldwide)
  - 4.5 card descriptions and link labels
  - 4.6 Shopify section
  - 4.7 Custom software section
  - 4.8 AI automation section
  - 4.9 label and title
  - 4.10 intro, and the case-study year, description and result lines (tiles only hold a title and services)
  - 4.11 label and five reasons
  - 4.12 FAQ (11 questions, so no FAQPage schema)
  - 4.13 final CTA
- **About:**
  - 5.1 label
  - 5.7 What we do (the Capabilities accordion carries the three services from 4.5 with their 4.6, 4.7 and 4.8 lists, first five items each)
  - 5.8 Where we work
  - 5.10 founder bio and LinkedIn link (no founder area on this page; the short bio is used in schema)
  - 5.11 How we work with you
  - 5.12 FAQ
  - second CTA button (WhatsApp)
- **Contact:**
  - 6.1 label
  - 6.2 three ways to reach us
  - 6.3 details block (the registered address shows in the footer on this page)
  - text under the submit button
  - 6.5 what happens next
  - FAQ slots 5–6 keep their existing Q&A ("What does a project cost?", "What makes working with you different?"), which is in the FAQPage schema because it's visible
- **Branding:**
  - secondary button
  - 7.5 packages and note
  - 7.6 process
  - 7.7 what you receive
  - 7.8 industries
  - 7.9 (no work section on the page)
  - 7.11 FAQ
  - WhatsApp button
  - four cards with no matching service keep their existing text: Marketing Sites, Product UI, Event Marketing, Newsletter Design
- **Shopify:**
  - 8.4 item 11 (care plans)
  - 8.6 packages table
  - 8.7 process
  - 8.8 (no work section)
  - 8.10 FAQ
  - WhatsApp button
  - the "Your commerce team" section keeps its existing copy
- **Website & app:**
  - secondary button
  - 9.5 engagement table and note
  - 9.6 process
  - 9.7 tech stack
  - 9.8 industries
  - 9.11 FAQ
  - WhatsApp button
  - the Accessibility card keeps its text
- **AI automation:**
  - secondary button
  - 10.4 time leaks
  - 10.6 use-case table
  - 10.7 ROI illustration
  - 10.8 packages (except the audit, used for card 1)
  - 10.9 process
  - 10.10 tools
  - 10.11 data protection
  - 10.14 FAQ
  - WhatsApp button

Card grids with more slots than brief items were filled by role (e.g. Packaging → the Packaging card) rather than strictly in order, so icons still fit their text. Each card's subtitle takes the lead phrase of the brief's description, and the body takes the rest.

## 4. Text shortened because the brief's version broke the layout

| Where | Brief | Used | Why |
|-|-|-|-|
| Header CTA (all pages) | Book a free strategy call | Free call | Overlapped the logo at 390px (≈100px free). The full wording is in the link's `title` |
| Branding H1 | Branding Agency for Brands That Want to Sell, Not Just Look Good | Branding Agency for Brands That Want to Sell | Display lines broke mid-word at both widths |
| Shopify H1 | Shopify Brand Development — From Scratch to Sales | …Development From Scratch… | The dash line wrapped at 390px |
| Branding hero and CTA buttons | Book a free brand consultation | Book a free consultation | Button wrapped, or overflowed the screen, at 390px |
| AI CTA button | Get my free automation audit | Get my free audit | Overflowed at 390px |
| Home services line | Custom Software & App Development | Custom Software & Apps | Wrapped and orphaned the comma at 390px |

Longer, but the layout holds:
- Home focus strip heading (5→6 lines)
- About story (three paragraphs in one slot)
- Shopify intro display block
- Home third stat caption (4 lines on phones)

The service-page CTA buttons draw their label with CSS (`content:` for the hover effect). Only those content strings were updated.

## 5. Decisions for the owner (not changed, per the brief's rules)

1. **Unapproved testimonials are live.** Quotes attributed to "Hanne S.", "Atanas D.", "Katarina B.", "Hamid T.", "Patricia W.", "Melanie D." and "Katrin B." appear on Contact, the service pages and Work. They come from the template. The brief says no quotes are approved, so removing them needs a UI change.
2. **Template case studies are live.** The 13 `portfolio/*` pages (Northwind Logistics, Meridian Health and others) carry invented clients and results, such as "an agent handling roughly 70% of daily exceptions". They are linked from Home tiles 3–6, Work and the menu's "Industries" column. Recommend unpublishing or replacing them.
3. **Images and logos from the template.** Hero, About and Contact photos, and many images, have filenames referencing "payam-zadeh" and Cologne. The client-logo strip may not be Codilated's clients. Kept per the brief; please confirm.
4. **Consent and analytics.**
   - The leftover Borlabs cookie plugin sets Google Consent Mode to "denied" on every page, but its banner is broken (its scripts return 404), so consent can never be granted. With a GA4 ID set, analytics will run in denied, cookieless mode.
   - The privacy policy says "Analytics loads only with your consent".
   - Either add a working consent banner (a UI change) or remove the Borlabs snippet and update the policy.
5. **Terms of Service governing law** still names California. The company is a Florida LLC. This is a legal decision, so it was not edited.
6. **Social links** to GitHub and X exist (footer "Get in touch" column, menu, Legal Notice), but the brief lists only LinkedIn and Instagram. Kept per the brief; remove or confirm.
7. **Contact page has 3 H1s** (one per form step). Every other page has exactly one.
8. **Pages outside the brief** (How we help, Services index, Digital Marketing, Social Media, WordPress, blog, categories) still use the older "AI-first software agency" positioning and list services beyond the four core ones. Only factual fixes were applied there.

## 6. Checks

- **Acceptance script** (raw HTML, no JavaScript), all seven brief pages pass:
  - exact title and description, self-canonical, OG and Twitter tags
  - headline, body copy and FAQ text in the raw HTML
  - JSON-LD present
  - no price properties
  - FAQPage schema matches the visible FAQ word for word
- **Scans of visible text and schema:**
  - no prices, currency amounts or "starting from" (only "AED pricing" set up inside clients' stores, which the brief allows)
  - no `[brackets]` or TBD
  - "Florida" appears only with Codilated LLC or the registered address
  - no "Shopify Partner"
- **Not yet run:** Google's Rich Results Test. The JSON-LD parses and follows schema.org, but run it on the live URLs after deploy; it can't validate a local site.
- **Not verifiable locally:** `.htaccess` (redirects, `text/plain` for llms.txt, no-cache on `site-config.js`), because there is no Apache here. After deploy, check:
  - `curl -I https://codilated.com/llms.txt` returns `text/plain`
  - `curl -I https://codilated.com/branding` returns 301
- **Lighthouse (mobile, local static server without gzip)**, before → after:

| Page | Performance | Accessibility | Best practices | SEO |
|-|-|-|-|-|
| Home | 48 → 52 | 95 → 95 | 96 → 96 | 92 → 92 |
| About | 39 → 42 | 86 → 93 | 96 → 96 | 85 → 92 |
| Contact | 43 → 47 | 94 → 100 | 96 → 96 | 85 → 92 |
| Branding | 43 → 47 | 95 → 95 | 96 → 96 | 92 → 92 |
| Shopify | 44 → 44 | 88 → 95 | 96 → 96 | 85 → 92 |
| Website & app | 35 → 48 | 95 → 95 | 96 → 96 | 92 → 92 |
| AI automation | 48 → 48 | 95 → 95 | 96 → 96 | 92 → 92 |

Performance is limited by very heavy pages and images (LCP 17–45s under Lighthouse's simulated mobile throttling). Fixing that means image compression and removing unused theme code, not copy work. Remaining SEO item: the theme's back-to-top link has no `href`.

## 7. Run and deploy

- **Preview the site:** `npx http-server . -e html`, then open `http://localhost:8080/about`.
- **Deploy the site:** push to `main`. The workflow writes `assets/site-config.js` from Actions variables, regenerates `sitemap.xml`, and FTPs the site. It skips `server/`, `scripts/` and Markdown.
- **Contact API:** see [server/README.md](server/README.md). Deploy `server/` to any Node 20+ host (a Hostinger Node.js app, VPS, Render…) and set its environment from `.env.example`.
- **GitHub → Settings → Actions → Variables:**
  - `VITE_GA_MEASUREMENT_ID` (GA4 ID)
  - `API_BASE` (the API's public origin, e.g. `https://api.codilated.com`)
- **Until `API_BASE` is set and the API is live**, the form shows the brief's error message ("…or email info@codilated.com") on submit.

## 8. Remaining items (brief §13) and where to edit

- **Case-study screenshots:**
  - Nur by Juggun and Juggun's Organics tiles use template images: `wp-content/uploads/2024/03/branding-folder-druckdesign-koeln.jpg` and `wp-content/uploads/2024/05/website-konzept-schulen-koeln.jpg`.
  - Replace the files, or the `src` in `index.html` and `portfolio/index.html`.
- **Client quotes:** none approved. The testimonial sliders are in `contact.html`, `services/*.html` and `portfolio/index.html` (see item 5.1).
- **Measurable results:** tiles have no result line. Results belong on case-study pages once they exist under `portfolio/`.
- **New case studies** (custom software, AI automation, a UAE project): new pages under `portfolio/`, then add them to the Work tiles.
- **Secrets:**
  - GA4 ID → Actions variable `VITE_GA_MEASUREMENT_ID`
  - `MONGODB_URI`, `SMTP_*`, `CONTACT_NOTIFY_EMAIL` → the API host's environment
  - never commit them (`.env` is git-ignored)
