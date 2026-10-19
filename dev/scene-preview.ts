// Dev-only: renders a world at a given phase for screenshots. Usage: /dev/scene.html?world=akhra&phase=dusk
import '../src/scene/scene.css';
import { paletteCss } from '../src/scene/palettes';
import { akhraScene } from '../src/scene/akhra';

const q = new URLSearchParams(location.search);
const style = document.createElement('style');
style.textContent = paletteCss();
document.head.append(style);
document.documentElement.dataset.phase = q.get('phase') ?? 'dusk';
const scenes: Record<string, () => string> = { akhra: akhraScene };
document.getElementById('scene')!.innerHTML = (scenes[q.get('world') ?? 'akhra'] ?? akhraScene)();
