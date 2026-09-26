# Anatomy Atelier

A 3D anatomy atelier: nine organs, twelve locales, a labelling quiz, guided
lessons, and ChatGPT-signed-in learner progress on Cloudflare D1.

Explore heart, brain, lungs, liver, kidneys, eye, intestine, pancreas, and
skin. The UI ships in English, Spanish, Hindi, Chinese, Arabic, Portuguese,
French, German, Japanese, Russian, Indonesian, and Korean.

Guided lessons ship for all nine organs in all twelve locales:
`heart-blood-flow`, `brain-lobes`, `lungs-airway`, `liver-dual-blood`,
`kidneys-filter-path`, `eye-light-path`, `intestine-absorb`,
`pancreas-dual-gland`, and `skin-layers`.

This app runs on [vinext](https://github.com/cloudflare/vinext). It does
not use `wrangler.jsonc`. `.openai/hosting.json` declares the Sites D1
binding; `vite.config.ts` simulates that binding for local Miniflare.

## Prerequisites

- Node.js `>=22.13.0`

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Scripts

- `npm run dev` — vinext / Vite local server
- `npm run build` — vinext production build
- `npm run build:next` — Next.js build only
- `npm run db:generate` — generate Drizzle migrations after `db/schema.ts` changes
- `npm run i18n:audit` — check locale coverage
- `npm run test:progress` — unit tests for mastery, recommend-next, and streaks

## Auth

Identity comes from OpenAI Sites / ChatGPT headers, not from an app-owned
login. The verified address is `oai-authenticated-user-email`. Helpers live
in `app/chatgpt-auth.ts` (`getChatGPTUser`, `requireChatGPTUser`, sign-in /
sign-out paths). Dispatch owns `/signin-with-chatgpt`,
`/signout-with-chatgpt`, and `/callback` — do not add app routes for those
paths.

Progress keys each learner by the SHA-256 of the normalized email. The raw
address is never stored. See `app/lib/progress/server.ts`.

## Data

Learner progress uses Cloudflare D1 through the `DB` binding:

- `.openai/hosting.json` sets `"d1": "DB"` (R2 stays unused)
- `db/schema.ts` defines `learners`, `progress_events`, `organ_mastery`,
  and `lesson_progress`
- `drizzle/0000_messy_inhumans.sql` is the generated migration
- `db/index.ts` opens Drizzle against `env.DB`

Without the D1 binding — or if the tables have not been applied — the
progress API returns `{ available: false }` and the UI hides progress
instead of crashing.

This repo has no `wrangler.jsonc`. Local Vite uses the placeholder
database id already in `vite.config.ts` (`site-creator-d1`). Do not treat
that placeholder as a production `database_id`.

## Applying migrations

`drizzle-kit migrate` is not wired here: `drizzle.config.ts` has no
database URL and no D1 HTTP credentials. Use Wrangler against the SQL
file.

### Local Miniflare (same persist as `npm run dev`)

`@cloudflare/vite-plugin` persists D1 under `.wrangler/state`. Wrangler
still needs a config that names the same binding Vite injects. This
project does not commit one. Write a throwaway config (do not check it
in) that matches `vite.config.ts`:

```jsonc
{
  "name": "anatomy-atelier-local-d1",
  "compatibility_date": "2026-09-25",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "site-creator-d1",
      "database_id": "00000000-0000-4000-8000-000000000000"
    }
  ]
}
```

Then, with Node `>=22.13` and that file as `--config`:

```bash
npx wrangler d1 execute site-creator-d1 \
  --local \
  --persist-to=.wrangler/state \
  --file=./drizzle/0000_messy_inhumans.sql \
  --config=/path/to/that-wrangler.jsonc
```

That creates `learners`, `lesson_progress`, `organ_mastery`, and
`progress_events` in the local persist directory. Re-run only if you
wipe `.wrangler/state`.

### Production D1

The dedicated database is `anatomy-atelier`. Schema
(`learners`, `lesson_progress`, `organ_mastery`, `progress_events`) is
already applied remotely. Later schema changes:

```bash
npx wrangler d1 execute anatomy-atelier \
  --remote \
  --file=./drizzle/<new-migration>.sql
```

`.openai/hosting.json` declares the binding name `DB`. Point the OpenAI
Sites / Cloudflare control plane at this D1 so the live site can write
progress. Do not reuse an unrelated D1 from another project.

## Learn more

- [vinext](https://github.com/cloudflare/vinext)
- [Drizzle D1 guide](https://orm.drizzle.team/docs/get-started/d1-new)
