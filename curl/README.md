# curl quick reference

```bash
export STUDIO99_API_KEY=your_key   # https://accounts.studio99.app/dashboard/products/studio99-api
```

**No key needed**

```bash
curl https://studio99.app/api/v1/health
curl https://studio99.app/api/v1/capabilities
```

**Fonts** (free read)

```bash
curl "https://studio99.app/api/v1/fonts?language=marathi&mood=festive&limit=5" \
  -H "X-API-Key: $STUDIO99_API_KEY"
```

**Generate** (1 credit per variant)

```bash
curl -X POST https://studio99.app/api/v1/generate \
  -H "X-API-Key: $STUDIO99_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"shubh vivah","language":"hindi","use_case":"wedding","count":4}'
```

Save the first variant as an SVG file (needs `jq`):

```bash
curl -s -X POST https://studio99.app/api/v1/generate \
  -H "X-API-Key: $STUDIO99_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"શુભ લગ્ન","count":1}' \
  | jq -r '.data.generatedResults[0].svg.svgString' > shubh-lagna.svg
```

**Render in one exact font** (1 credit)

```bash
curl -X POST https://studio99.app/api/v1/render \
  -H "X-API-Key: $STUDIO99_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"दिवाळीच्या शुभेच्छा","fontId":"FONT_ID_FROM_/fonts","fontSize":120,"format":"svg"}'
```

**Library** (search free, download 1 credit)

```bash
curl "https://studio99.app/api/v1/library/search?q=ganesh&limit=5" -H "X-API-Key: $STUDIO99_API_KEY"
curl "https://studio99.app/api/v1/library/ARTWORK_ID/download?format=SVG" -H "X-API-Key: $STUDIO99_API_KEY"
```

Every metered response includes `usage` (credits used, limit, remaining) and `X-RateLimit-*` headers. Errors look like `{"success":false,"error":{"code":"INSUFFICIENT_CREDITS","message":"..."}}`.
