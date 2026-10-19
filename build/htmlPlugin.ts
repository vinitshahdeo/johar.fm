import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { akhraScene } from '../src/scene/akhra';
import { paletteCss } from '../src/scene/palettes';
import { getDayPhase } from '../src/time/dayPhase';
import { en, nag } from '../src/i18n/strings';
import {
  FAQ, KEYWORDS, SEO_DESCRIPTION, SEO_TITLE, SHARE_DESCRIPTION, SHARE_TITLE, SITE_URL, SUGGEST_URL,
} from '../src/content/site';
import { esc } from './html';
import { markdown } from './markdown';


function seoTags(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'johar.fm',
        alternateName: ['Johar FM', 'जोहार.fm', 'Nagpuri Songs Radio'],
        url: `${SITE_URL}/`,
        inLanguage: 'en-IN',
        description: SEO_DESCRIPTION,
        keywords: KEYWORDS.join(', '),
      },
      {
        '@type': 'WebApplication',
        name: 'johar.fm',
        url: `${SITE_URL}/`,
        description: SEO_DESCRIPTION,
        applicationCategory: 'MultimediaApplication',
        genre: ['Nagpuri', 'Sadri', 'Khortha', 'Jharkhandi folk'],
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        countryOfOrigin: { '@type': 'Country', name: 'India' },
        locationCreated: { '@type': 'Place', name: 'Ranchi, Jharkhand' },
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
    `<meta property="og:site_name" content="johar.fm" />`,
    `<meta property="og:title" content="${esc(SHARE_TITLE)}" />`,
    `<meta property="og:description" content="${esc(SHARE_DESCRIPTION)}" />`,
    `<meta property="og:url" content="${SITE_URL}/" />`,
    `<meta property="og:image" content="${og}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="A village akhra at dusk under sal trees, with the johar.fm radio." />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(SHARE_TITLE)}" />`,
    `<meta name="twitter:description" content="${esc(SHARE_DESCRIPTION)}" />`,
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
 * - i18n strings for {{en.key}} / {{nag.key}} placeholders,
 * - SEO tags and JSON-LD, and the rendered CREDITS.md.
 * Also emits sitemap.xml and robots.txt.
 */
export function htmlPlugin(): Plugin {
  return {
    name: 'joharfm-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const prePaint = `(function(){try{var q=new URLSearchParams(location.search).get('phase');var p=(${getDayPhase.toString()})(new Date());document.documentElement.dataset.phase=/^(morning|afternoon|dusk|night)$/.test(q||'')?q:p}catch(e){}})()`;
        return html
          .replace('<!--HEAD-->', `${seoTags()}\n    <style>${paletteCss()}</style>\n    <script>${prePaint}</script>`)
          .replace('<!--SCENE-->', akhraScene())
          .replace(/\{\{site\.suggestUrl\}\}/g, esc(SUGGEST_URL))
          .replace(/\{\{site\.url\}\}/g, esc(SITE_URL))
          .replace(/\{\{site\.title\}\}/g, esc(SEO_TITLE))
          .replace(/\{\{site\.description\}\}/g, esc(SEO_DESCRIPTION))
          .replace('<!--CREDITS-->', () => markdown(readFileSync(new URL('../CREDITS.md', import.meta.url), 'utf8')))
          .replace(/\{\{(en|nag)\.(\w+)\}\}/g, (m, lang: 'en' | 'nag', key: string) => {
            const table: Record<string, string> = lang === 'nag' ? nag : en;
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
