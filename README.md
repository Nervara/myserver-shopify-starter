# myserver Shopify App Starter

A deploy-ready **Shopify embedded app** — [Remix](https://remix.run) +
[Polaris](https://polaris.shopify.com) + **Postgres session storage** — that
runs on [myserver](https://github.com/Nervara/myserver) (or Coolify, Dokploy,
or any Docker host) in a few minutes.

It's Shopify's official Remix template with the two changes you need to actually
**deploy** it:

1. **Postgres session storage** instead of SQLite. A file-on-disk session store
   doesn't survive a container redeploy and can't be shared across replicas —
   so sessions live in Postgres (`@shopify/shopify-app-session-storage-prisma`).
2. **A `Dockerfile`** that runs DB migrations on boot, so the platform can
   build and run it with zero extra setup.

Everything else is a normal Shopify app: OAuth install flow, App Bridge
embedding, the Admin GraphQL API, and an `app/uninstalled` webhook.

---

## Deploy on myserver

### Option A — one-click template (recommended)

In myserver: **Catalog → Templates → "Shopify App (Remix + Postgres)" →
Install**. The template creates:

- an **app** pointing at this repo (build pack: Dockerfile),
- a **Postgres** database (wired into `DATABASE_URL` automatically),
- the env-var placeholders you fill in: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`,
  `SCOPES`.

Then: generate a domain in the **Domains** panel, copy it into `SHOPIFY_APP_URL`,
register that URL in your Shopify Partner dashboard, and **Deploy**.

### Option B — deploy this repo manually

1. **Create app** → source: **Git** → this repo's URL → build pack **Dockerfile**.
2. **Create a Postgres database** resource in the same environment. Copy its
   internal connection string into the app's `DATABASE_URL` variable.
3. In the app's **Variables** panel set:
   - `SHOPIFY_API_KEY` — your app's Client ID (Partner dashboard)
   - `SHOPIFY_API_SECRET` — your app's Client secret (mark as secret)
   - `SCOPES` — e.g. `write_products`
   - `SHOPIFY_APP_URL` — the public HTTPS URL from the **Domains** panel
4. Set **Ports / Exposes** to `3000` and **Health Check Path** to `/healthz`.
5. **Generate a domain** (sslip.io or a custom domain), put it in
   `SHOPIFY_APP_URL`, and **Deploy**.

### Wire up Shopify

In your [Shopify Partner dashboard](https://partners.shopify.com) → your app →
**Configuration**, set:

- **App URL**: `https://<your-app-url>`
- **Allowed redirection URL(s)**: `https://<your-app-url>/auth/callback`

Install it on a development store and you'll land on the embedded home page.

---

## Local development

```bash
npm install
cp .env.example .env        # fill in your values
npm run dev                 # uses the Shopify CLI tunnel
```

`npm run dev` needs the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)
and a Partner account. For local Postgres, point `DATABASE_URL` at any Postgres
instance (`docker run -e POSTGRES_PASSWORD=pw -p 5432:5432 postgres:16`).

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `SHOPIFY_API_KEY` | yes | App Client ID from the Partner dashboard |
| `SHOPIFY_API_SECRET` | yes (secret) | App Client secret |
| `SCOPES` | yes | Comma-separated access scopes |
| `SHOPIFY_APP_URL` | yes | Public HTTPS URL of the deployed app |
| `DATABASE_URL` | yes | Postgres connection string |
| `PORT` | no | Listen port (default `3000`) |
| `SHOP_CUSTOM_DOMAIN` | no | Extra allowed shop domain for testing |

---

## Project layout

```
app/
  shopify.server.ts            shopifyApp() config — Postgres session storage
  db.server.ts                 Prisma client
  routes/
    _index.tsx                 public landing / install entry
    app.tsx                    embedded app shell (AppProvider + auth)
    app._index.tsx             home page — calls the Admin GraphQL API
    auth.$.tsx                 OAuth begin/callback
    webhooks.app.uninstalled.tsx   clears sessions on uninstall
    healthz.tsx                health check (point myserver at /healthz)
prisma/
  schema.prisma                Session model (Postgres)
  migrations/                  baseline migration, applied on boot
Dockerfile                     multi-stage build + migrate-on-start
```

## How sessions work

`@shopify/shopify-app-session-storage-prisma` stores each shop's offline access
token in the `Session` table. The `Dockerfile`'s start command runs
`prisma migrate deploy` before serving, so the table exists on first boot and
stays in sync on every redeploy. Because it's Postgres (not SQLite), you can
scale the app to multiple replicas and sessions are shared across all of them.

---

## License

MIT — use it as the base for your own app.
