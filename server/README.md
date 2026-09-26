# Codilated contact API

Receives the enquiry form on `/contact`, stores each enquiry as a `Lead` in MongoDB and emails a notification.

## Endpoints

| Method | Path | Purpose |
|-|-|-|
| `POST` | `/api/contact` | Submit an enquiry (JSON). `201 {ok:true}` · `400 {ok:false, errors:{field:message}}` · `429` after 5 requests per 15 minutes per IP |
| `GET` | `/api/health` | Liveness check |

The lead is saved **before** the email is sent. If the email fails, the lead is kept and its `notification.status` is set to `failed`. Without SMTP settings, leads are stored with `notification.status: "disabled"`.

## Run locally

```bash
cd server
npm install
cp ../.env.example .env   # then fill in MONGODB_URI (and SMTP_* to test emails)
npm run dev               # http://localhost:3001
npm test                  # unit tests + one test against an in-memory MongoDB
```

To point the local site at it, run `API_BASE=http://localhost:3001 node scripts/write-site-config.mjs` from the repo root. The script only accepts `https://` origins, so for a local test edit `assets/site-config.js` by hand and don't commit it. Add the site's origin (for example `http://localhost:8080`) to `CORS_ORIGIN`.

## Deploy

The website is uploaded to Hostinger over FTP, and FTP hosting can't run Node, so the API runs separately. Any Node 20+ host works, for example:
- a Hostinger Node.js app on a subdomain such as `api.codilated.com`
- a Hostinger VPS
- Render or Railway

1. Deploy this `server/` folder with start command `npm start`.
2. Set the environment variables from `.env.example`:
   - `MONGODB_URI` (for example MongoDB Atlas)
   - `SMTP_*`
   - `CONTACT_NOTIFY_EMAIL`
   - `CORS_ORIGIN=https://codilated.com,https://www.codilated.com`
   - `TRUST_PROXY=1` when behind one proxy or load balancer
3. In the GitHub repository settings, set the Actions variable `API_BASE` to the API's public origin (for example `https://api.codilated.com`). The next deploy writes it into `assets/site-config.js`.

If the API is instead served from the site's own origin under `/api/` (a reverse proxy), leave `API_BASE` empty.
