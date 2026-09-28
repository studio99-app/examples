'use client';

import { useState } from 'react';

type Img = { font: string; text: string; src: string | null; svg: string | null };
type Result = { heading: Img[]; names: Img[]; creditsLeft: number | null };

export default function Page() {
  const [form, setForm] = useState({ bride: 'Priya', groom: 'Rahul', language: 'hindi', heading: 'shubh vivah' });
  const [result, setResult] = useState<Result | null>(null);
  const [pick, setPick] = useState({ heading: 0, names: 0 });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setError(json.error ?? 'Something went wrong.');
    setResult(json);
    setPick({ heading: 0, names: 0 });
  }

  function download(img: Img, name: string) {
    if (!img.svg) return;
    const url = URL.createObjectURL(new Blob([img.svg], { type: 'image/svg+xml' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${name}.svg` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const head = result?.heading[pick.heading];
  const names = result?.names[pick.names];

  return (
    <main>
      <h1>Wedding invite, in real calligraphy</h1>
      <p className="muted">Type the names in English letters. Studio99 writes them in Hindi, Marathi or Gujarati.</p>

      <form onSubmit={create}>
        <input value={form.bride} onChange={set('bride')} placeholder="Bride" maxLength={24} required />
        <input value={form.groom} onChange={set('groom')} placeholder="Groom" maxLength={24} required />
        <select value={form.language} onChange={set('language')}>
          <option value="hindi">Hindi</option>
          <option value="marathi">Marathi</option>
          <option value="gujarati">Gujarati</option>
        </select>
        <select value={form.heading} onChange={set('heading')}>
          <option value="shubh vivah">Shubh Vivah</option>
          <option value="shubh vivah sohala">Shubh Vivah Sohala</option>
          <option value="shubh lagna">Shubh Lagna</option>
        </select>
        <button disabled={busy}>{busy ? 'Creating…' : 'Create invite'}</button>
      </form>
      {error && <p className="error">{error}</p>}

      {result && head && names && (
        <>
          <section className="card">
            {head.src && <img src={head.src} alt={head.text} className="heading" />}
            {names.src && <img src={names.src} alt={names.text} className="names" />}
            <p className="date">request the pleasure of your company</p>
          </section>

          <h2>Pick a style</h2>
          {(['heading', 'names'] as const).map((part) => (
            <div key={part} className="row">
              {result[part].map((img, i) => (
                <button key={i} className={pick[part] === i ? 'on' : ''} onClick={() => setPick({ ...pick, [part]: i })}>
                  {img.src && <img src={img.src} alt={img.font} />}
                </button>
              ))}
            </div>
          ))}

          <div className="row">
            <button onClick={() => download(head, 'heading')} disabled={!head.svg}>Download heading SVG</button>
            <button onClick={() => download(names, 'names')} disabled={!names.svg}>Download names SVG</button>
          </div>
          {!head.svg && <p className="muted">Free plan: watermarked previews. Upgrade the API key for clean SVG.</p>}
          {result.creditsLeft !== null && result.creditsLeft >= 0 && (
            <p className="muted">Credits left this month: {result.creditsLeft}</p>
          )}
        </>
      )}
    </main>
  );
}
