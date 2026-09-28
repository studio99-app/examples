# Wedding invite (Next.js)

Guests type two names in English letters; the page returns a wedding invite heading and the couple's names in real Hindi, Marathi or Gujarati calligraphy, with three styles to pick from and editable SVG downloads.

```bash
cp .env.example .env.local     # put your key in STUDIO99_API_KEY
npm install
npm run dev                    # http://localhost:3000
```

Each "Create invite" costs **6 credits** (3 heading variants + 3 name variants). The Free plan (100 credits a month) returns watermarked previews; paid keys return clean SVG.

## How it is built

- `app/api/invite/route.ts` is the only code that talks to Studio99. The key stays on the server.
- The page shows results as `<img src="data:image/svg+xml;base64,...">`, never as inline SVG markup, so nothing in an image can run script in your page.
- The route is public and spends your credits, so it caps names at 24 letters, fixes the variant count, and allows 5 tries a minute per IP. That limiter lives in memory on one server; on serverless or several instances use a shared store (Redis, Upstash, your database) before you go live.
- Names are typed in Latin letters and transliterated by the API. The joining word (`sang` / `ani` / `ane`) is transliterated the same way.

Get a key: https://accounts.studio99.app/dashboard/products/studio99-api · Docs: https://studio99.app/developers/docs
