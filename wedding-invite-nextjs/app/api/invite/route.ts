// Server route: the ONLY place the Studio99 API key is used. The browser never sees it.
import { NextResponse } from 'next/server';
import { Studio99, Studio99Error, type GeneratedResult } from '@studio99/api';

const s99 = new Studio99(); // reads STUDIO99_API_KEY from the server environment

// The word joining the two names, typed in Latin letters; Studio99 transliterates it.
const JOIN: Record<string, string> = { hindi: 'sang', marathi: 'ani', gujarati: 'ane' };
const HEADINGS = ['shubh vivah', 'shubh vivah sohala', 'shubh lagna'];

// This demo route is public and every call spends your credits, so it is guarded:
// fixed variant count, short names, and a small per-IP limit (per server instance).
const hits = new Map<string, { n: number; reset: number }>();
function allow(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return true;
  }
  return ++h.n <= 5;
}

function toImages(results: GeneratedResult[]) {
  // Send images, not raw SVG markup: the page shows them in <img>, which never runs scripts.
  return results.map((r) => ({
    font: r.fontFamily,
    text: r.resultText,
    src: r.svg
      ? `data:image/svg+xml;base64,${Buffer.from(r.svg.svgString).toString('base64')}`
      : r.preview
        ? `data:image/jpeg;base64,${r.preview.base64}` // Free plan: watermarked preview
        : null,
    svg: r.svg?.svgString ?? null,
  }));
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!allow(ip)) return NextResponse.json({ error: 'Too many tries, wait a minute.' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const bride = String(body.bride ?? '').trim().slice(0, 24);
  const groom = String(body.groom ?? '').trim().slice(0, 24);
  const language = JOIN[body.language] ? String(body.language) : 'hindi';
  const heading = HEADINGS.includes(body.heading) ? String(body.heading) : HEADINGS[0];
  if (!bride || !groom || !/^[\p{L}\s.'-]+$/u.test(bride + groom)) {
    return NextResponse.json({ error: 'Enter both names (letters only).' }, { status: 400 });
  }

  try {
    const [head, names] = await Promise.all([
      s99.generate({ text: heading, language: language as 'hindi', use_case: 'wedding', count: 3 }),
      s99.generate({ text: `${bride} ${JOIN[language]} ${groom}`, language: language as 'hindi', use_case: 'names', count: 3 }),
    ]);
    return NextResponse.json({
      heading: toImages(head.data.generatedResults),
      names: toImages(names.data.generatedResults),
      creditsLeft: names.usage?.remaining ?? null,
    });
  } catch (e) {
    if (e instanceof Studio99Error) {
      console.error('Studio99', e.code, e.message);
      const msg = e.code === 'INSUFFICIENT_CREDITS' ? 'This demo is out of credits this month.' : 'Could not create the artwork.';
      return NextResponse.json({ error: msg }, { status: e.status === 429 ? 429 : 502 });
    }
    throw e;
  }
}
