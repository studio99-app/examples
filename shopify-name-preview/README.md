# Shopify: personalised product name preview

Shoppers type a name, see it in three Hindi, Marathi or Gujarati calligraphy styles, pick one, and the choice is saved on the order. Useful for nameplates, mugs, frames, jewellery and t-shirts.

| File | Goes where |
|---|---|
| `worker.js` | A Cloudflare Worker (free tier is enough). Holds your API key. |
| `studio99-name-preview.liquid` | Your theme's `snippets/` folder, rendered inside the product form |

## Setup

```bash
npm create cloudflare@latest studio99-preview -- --type hello-world
# replace src/index.js with worker.js, then:
npx wrangler secret put STUDIO99_API_KEY
npx wrangler deploy --var SHOP_ORIGIN:https://your-shop.com
```

In the product template: `{% render 'studio99-name-preview', worker_url: 'https://studio99-preview.YOURNAME.workers.dev' %}`

## Production artwork

Each preview costs **3 credits**. The order carries `Calligraphy text` and the hidden `_Calligraphy style` (a `fontId`). To make the print file, call `POST /render` with that exact text and fontId: the result is identical to what the shopper picked, as a clean SVG (paid plans).

```bash
curl -X POST https://studio99.app/api/v1/render \
  -H "X-API-Key: $STUDIO99_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"प्रिया","fontId":"<from the order>","fontSize":200,"format":"svg"}'
```

## Safety

- The key never appears in the theme. The Worker only accepts requests from your shop's origin.
- Add a Cloudflare rate-limiting rule on the Worker route (for example 10 requests a minute per IP) so nobody can drain your credits.
- Previews are shown as `<img>`, never inline SVG.
