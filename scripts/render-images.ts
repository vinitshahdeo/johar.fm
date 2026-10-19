/**
 * Renders public/og.png (1200×630) from the live Akhra scene at dusk, plus app icons, using local
 * headless Chrome so the output matches the real CSS. Run after changing the default scene:
 *
 *   npm run og                       # uses Chrome at the usual macOS/Linux path
 *   CHROME_PATH=/path/to/chrome npm run og
 *
 * The images are committed; Vercel builds don't need Chrome.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean) as string[];
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.error('Chrome not found. Set CHROME_PATH.');
  process.exit(1);
}

const server = await createServer({ root, server: { port: 0 }, logLevel: 'error' });
await server.listen();
const port = (server.httpServer!.address() as { port: number }).port;

// Async on purpose: a sync exec would block the event loop and the dev server couldn't answer Chrome.
const run = promisify(execFile);

async function shot(path: string, out: string, w: number, h: number) {
  await run(chrome!, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-prefers-reduced-motion',
    '--virtual-time-budget=5000', `--window-size=${w},${h}`, `--screenshot=${out}`,
    `http://localhost:${port}${path}`,
  ]);
  const kb = Math.round(statSync(out).size / 1024);
  console.log(`${out}  ${w}×${h}  ${kb} KB`);
  return kb;
}

try {
  const og = await shot('/dev/og.html', `${root}public/og.png`, 1200, 630);
  if (og >= 300) console.warn('warning: og.png is ≥ 300 KB; WhatsApp may not show it');
  await shot('/dev/icon.html?s=512', `${root}public/icon-512.png`, 512, 512);
  await shot('/dev/icon.html?s=180', `${root}public/apple-touch-icon.png`, 180, 180);
} finally {
  await server.close();
}
