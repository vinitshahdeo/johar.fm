// Builds the footer HTML at build time from data files, so it's in the static page for SEO.
import artists from '../src/data/artists.json';
import { en, nag } from '../src/i18n/strings';
import { FAQ, SUGGEST_URL } from '../src/content/site';
import { esc } from './html';

export function footerHtml(): string {
  const linked = (artists as { name: string; channelUrl: string }[]).filter((a) => a.channelUrl);
  const artistList = linked.length
    ? `<ul class="artists">${linked
        .map((a) => `<li><a href="${esc(a.channelUrl)}" target="_blank" rel="noopener">${esc(a.name)}</a></li>`)
        .join('')}</ul>`
    : `<p class="muted">Artist channel links coming soon.</p>`;
  return `
  <div class="foot-cols">
    <section>
      <h2>About</h2>
      ${FAQ.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
    </section>
    <section>
      <h2>Listen to the artists</h2>
      ${artistList}
    </section>
  </div>
  <nav class="foot-links" aria-label="Footer">
    <a href="${esc(SUGGEST_URL)}" target="_blank" rel="noopener"><span lang="hi">${esc(nag.suggest)}</span> · ${esc(en.suggest)}</a>
    <a href="/credits/">Credits</a>
    <a href="https://github.com/vinitshahdeo/mandar.fm" target="_blank" rel="noopener">Source</a>
  </nav>
  <p class="love"><span lang="hi">${esc(nag.madeWithLove)}</span><br />${esc(en.madeWithLove)}</p>
  <details class="keys"><summary>Keyboard shortcuts</summary>
    <dl><dt>Space</dt><dd>Play / pause</dd><dt>→</dt><dd>Next song</dd><dt>←</dt><dd>Restart song</dd>
    <dt>↑ ↓</dt><dd>Volume</dd><dt>1–4</dt><dd>Akhra, Trekker, Biha, Parab</dd><dt>A</dt><dd>Village sounds on/off</dd><dt>M</dt><dd>Mute</dd></dl>
  </details>`;
}
