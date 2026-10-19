import { describe, expect, it } from 'vitest';
import { markdown } from '../build/markdown';

describe('markdown', () => {
  it('renders the subset CREDITS.md uses', () => {
    const html = markdown('# Title\n\nSome *em* and **bold** with [a link](https://x.y).\n\n- one\n- two\n\n| A | B |\n|---|---|\n| 1 | 2 |');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<em>em</em>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<a href="https://x.y" rel="noopener">a link</a>');
    expect(html).toContain('<ul><li>one</li><li>two</li></ul>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>2</td>');
  });
  it('escapes HTML', () => {
    expect(markdown('<script>x</script>')).toBe('<p>&lt;script&gt;x&lt;/script&gt;</p>');
  });
});
