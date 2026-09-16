const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ESC[c]);

/** Escape text, then turn *asterisk spans* into italics (for journal names in YAML). */
export const inline = (s: unknown) => esc(s).replace(/\*([^*]+)\*/g, '<i>$1</i>');

/** Plain text version of an inline string, for meta tags and llms.txt. */
export const plain = (s: unknown) => String(s ?? '').replace(/\*([^*]+)\*/g, '$1').replace(/\s+/g, ' ').trim();

const isMe = (a: string) => /^Ryan F/.test(a);

/** Long author lists become "A, B, C, …, Ryan FJ, …, Z" with Ryan FJ in bold. */
export function authorsHtml(list: string[] = []) {
  if (!list.length) return '';
  let shown: (string | null)[] = list;
  if (list.length > 8) {
    const me = list.findIndex(isMe);
    const keep = new Set([0, 1, 2, list.length - 1]);
    if (me >= 0) keep.add(me);
    shown = [];
    let prev = -1;
    [...keep].sort((a, b) => a - b).forEach((i) => {
      if (i - prev > 1) shown.push(null);
      shown.push(list[i]);
      prev = i;
    });
  }
  return shown.map((a) => (a === null ? '…' : isMe(a) ? `<b>${esc(a)}</b>` : esc(a))).join(', ');
}

export const TOPICS: { key: string; label: string; rx: RegExp }[] = [
  { key: 'virome', label: 'Virome & phage', rx: /virome|phage|crass|viral transfer|viral dark/i },
  { key: 'immune', label: 'Immunology & vaccines', rx: /immun|vaccin|bcg|sars|covid|cytokine|cd40/i },
  { key: 'cancer', label: 'Cancer', rx: /cancer|tumou?r|oncolog|hct|haematopoietic|chemotherap|prostate/i },
  { key: 'gut', label: 'Gut health & IBD', rx: /inflammatory bowel|colonic|postbiotic|high-fat|listeria|antibiotic|faecal microbiota/i },
  { key: 'neuro', label: 'Gut–brain & neuro', rx: /brain|neuro|amygdala|cortex|serotonin|mesocorticolimbic|cognitive|afferent/i },
  { key: 'methods', label: 'Methods & software', rx: /taxsea|opustaxa|spingo|protocol|assembly software|machine learning|reproducible|pitfalls/i },
];
export const topicsFor = (title: string) => TOPICS.filter((t) => t.rx.test(title)).map((t) => t.key);

export const fmt = (n: number) => n.toLocaleString('en-AU');
