// Dev-only: renders a world at a given phase for screenshots. Usage: /dev/scene.html?world=akhra&phase=dusk
import '../src/scene/scene.css';
import { paletteCss } from '../src/scene/palettes';
import { akhraScene } from '../src/scene/akhra';
import { trekkerScene } from '../src/scene/trekker';
import { bihaScene } from '../src/scene/biha';
import { parabScene } from '../src/scene/parab';

const q = new URLSearchParams(location.search);
const style = document.createElement('style');
style.textContent = paletteCss();
document.head.append(style);
document.documentElement.dataset.phase = q.get('phase') ?? 'dusk';
const scenes: Record<string, () => string> = { akhra: akhraScene, trekker: trekkerScene, biha: bihaScene, parab: parabScene };
if (q.get('festival')) document.documentElement.dataset.festival = q.get('festival')!;
document.getElementById('scene')!.innerHTML = (scenes[q.get('world') ?? 'akhra'] ?? akhraScene)();
