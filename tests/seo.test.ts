import { describe, expect, it } from 'vitest';
import { SEO_DESCRIPTION, SEO_TITLE, SHARE_DESCRIPTION, SHARE_TITLE } from '../src/content/site';

describe('SEO copy', () => {
  it('fits in Google results without being cut off', () => {
    expect(SEO_TITLE.length).toBeLessThanOrEqual(60);
    expect(SEO_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });
  it('fits in WhatsApp / X previews', () => {
    expect(SHARE_TITLE.length).toBeLessThanOrEqual(60);
    expect(SHARE_DESCRIPTION.length).toBeLessThanOrEqual(120);
  });
  it('leads with what people search for', () => {
    expect(SEO_TITLE).toMatch(/^Nagpuri Songs/);
    expect(SEO_DESCRIPTION).toContain('Nagpuri superhit songs');
    expect(SEO_DESCRIPTION).toContain('Jharkhandi');
  });
});
