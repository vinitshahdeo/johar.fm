import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { akhraScene } from '../src/scene/akhra';
import { paletteCss } from '../src/scene/palettes';
import { getDayPhase } from '../src/time/dayPhase';
import { en, nag } from '../src/i18n/strings';
import { FAQ, SITE_URL } from '../src/content/site';
import { footerHtml } from './footer';
import { esc } from './html';
import { markdown } from './markdown';

const TITLE = 'mandar.fm — Nagpuri radio from Jharkhand | मांदर एफएम';
const DESCRIPTION =
  'A Nagpuri radio that never stops: theth Nagpuri, jhumar, trekker hits, biha and parab songs, under sal trees at a village akhra. नागपुरी गीत, अखड़ा, जोहार।';

function seoTags(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'mandar.fm',
        alternateName: 'मांदर एफएम',
        url: `${SITE_URL}/`,
        inLanguage: ['en', 'hi', 'sck'],
        description: DESCRIPTION,
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  const og = `${SITE_URL}/og.png`;
  return [
    `<link rel="canonical" href="${SITE_URL}/" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="mandar.fm" />`,
    `<meta property="og:title" content="${esc(TITLE)}" />`,
    `<meta property="og:description" content="${esc(DESCRIPTION)}" />`,
    `<meta property="og:url" content="${SITE_URL}/" />`,
    `<meta property="og:image" content="${og}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="A village akhra at dusk under sal trees, with the mandar.fm radio." />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(TITLE)}" />`,
    `<meta name="twitter:description" content="${esc(DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${og}" />`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
}

/**
 * Inlines into the HTML pages at build/dev time:
 * - the default Akhra scene SVG (renders before any JS, and is the LCP element),
 * - phase palettes as CSS custom properties,
 * - a tiny pre-paint script that sets data-phase from the local clock (same function as the app),
 * - i18n strings for {{nag.key}} / {{en.key}} placeholders,
 * - the footer, SEO tags and JSON-LD, and the rendered CREDITS.md.
 * Also emits sitemap.xml and robots.txt.
 */
export function htmlPlugin(): Plugin {
  return {
    name: 'mandarfm-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const prePaint = `(function(){try{var q=new URLSearchParams(location.search).get('phase');var p=(${getDayPhase.toString()})(new Date());document.documentElement.dataset.phase=/^(morning|afternoon|dusk|night)$/.test(q||'')?q:p}catch(e){}})()`;
        return html
          .replace('<!--HEAD-->', `${seoTags()}\n    <style>${paletteCss()}</style>\n    <script>${prePaint}</script>`)
          .replace('<!--SCENE-->', akhraScene())
          .replace('<!--FOOTER-->', footerHtml())
          .replace('<!--CREDITS-->', () => markdown(readFileSync(new URL('../CREDITS.md', import.meta.url), 'utf8')))
          .replace(/\{\{(nag|en)\.(\w+)\}\}/g, (m, lang: 'nag' | 'en', key: string) => {
            const table = (lang === 'nag' ? nag : en) as Record<string, string>;
            if (!(key in table)) throw new Error(`HTML: unknown string ${m}`);
            return esc(table[key]);
          });
      },
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = ['/', '/credits/'];
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`)
          .join('\n')}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
    },
  };
}
