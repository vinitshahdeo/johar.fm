import type { Plugin } from 'vite';
import { akhraScene } from '../src/scene/akhra';
import { paletteCss } from '../src/scene/palettes';
import { getDayPhase } from '../src/time/dayPhase';
import { en, nag } from '../src/i18n/strings';
import { footerHtml } from './footer';
import { esc } from './html';

/**
 * Inlines into index.html at build/dev time:
 * - the default Akhra scene SVG (renders before any JS, and is the LCP element),
 * - phase palettes as CSS custom properties,
 * - a tiny pre-paint script that sets data-phase from the local clock (same function as the app),
 * - i18n strings for {{nag.key}} / {{en.key}} placeholders,
 * - the footer.
 */
export function htmlPlugin(): Plugin {
  return {
    name: 'mandarfm-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const prePaint = `(function(){try{var q=new URLSearchParams(location.search).get('phase');var p=(${getDayPhase.toString()})(new Date());document.documentElement.dataset.phase=/^(morning|afternoon|dusk|night)$/.test(q||'')?q:p}catch(e){}})()`;
        return html
          .replace('<!--HEAD-->', `<style>${paletteCss()}</style>\n    <script>${prePaint}</script>`)
          .replace('<!--SCENE-->', akhraScene())
          .replace('<!--FOOTER-->', footerHtml())
          .replace(/\{\{(nag|en)\.(\w+)\}\}/g, (m, lang: 'nag' | 'en', key: string) => {
            const table = (lang === 'nag' ? nag : en) as Record<string, string>;
            if (!(key in table)) throw new Error(`index.html: unknown string ${m}`);
            return esc(table[key]);
          });
      },
    },
  };
}
