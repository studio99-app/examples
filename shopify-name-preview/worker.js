// Cloudflare Worker: the small backend a Shopify theme calls for a calligraphy name preview.
// Secrets (wrangler secret put): STUDIO99_API_KEY. Vars: SHOP_ORIGIN = "https://your-shop.com"
//
// Why a backend at all: a Shopify theme is public HTML, so an API key placed in it would be
// visible to every visitor. The key lives here; the theme only ever sees images.

const API = 'https://studio99.app/api/v1/generate';
const LANGS = new Set(['hindi', 'marathi', 'gujarati']);

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.SHOP_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    // Only your storefront may spend your credits.
    if (request.headers.get('Origin') !== env.SHOP_ORIGIN) return new Response('Forbidden', { status: 403 });

    const { name, language } = await request.json().catch(() => ({}));
    const text = String(name ?? '').trim().slice(0, 30);
    if (!text || !/^[\p{L}\s.'-]+$/u.test(text)) {
      return Response.json({ error: 'Letters only, up to 30.' }, { status: 400, headers: cors });
    }

    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': env.STUDIO99_API_KEY },
      body: JSON.stringify({ text, language: LANGS.has(language) ? language : 'hindi', use_case: 'names', count: 3 }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return Response.json({ error: 'Preview unavailable, please try again.' }, { status: 502, headers: cors });
    }

    const previews = json.data.generatedResults.map((r) => ({
      fontId: r.fontId,
      text: r.resultText,
      src: r.svg
        ? `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(r.svg.svgString)))}`
        : `data:image/jpeg;base64,${r.preview.base64}`,
    }));
    return Response.json({ previews }, { headers: cors });
  },
};
