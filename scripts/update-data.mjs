// Refreshes the auto-generated data files:
//   src/data/publications.json  ORCID works, de-duplicated, with Crossref authors and OpenAlex citations
//   src/data/bioconductor.json  TaxSEA download counts from Bioconductor
// Google Scholar totals are refreshed separately by scripts/update-scholar.R (Scholar blocks cloud servers).
import { readFile, writeFile } from 'node:fs/promises';
import { load as loadYaml } from 'js-yaml';

const ORCID = '0000-0002-1565-4598';
const UA = { 'User-Agent': 'feargalryan.com data refresh (https://feargalryan.com)' };
const root = new URL('../', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, headers = {}, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { ...UA, ...headers } });
    if (res.ok) return res.json();
    if (res.status === 404) return null;
    await sleep(1500 * (i + 1));
  }
  throw new Error(`Failed after ${tries} tries: ${url}`);
}

const overrides = loadYaml(await readFile(new URL('src/data/publication-overrides.yaml', root), 'utf8')) ?? {};
const hidden = new Set((overrides.hide ?? []).map((d) => d.toLowerCase()));
const journalNames = overrides.journal_names ?? {};

// 1. ORCID works
const works = await getJSON(`https://pub.orcid.org/v3.0/${ORCID}/works`, { Accept: 'application/json' });
const isPreprintDoi = (doi) => /^10\.1101\/|^10\.64898\/|preprints/.test(doi);
const items = works.group.map((g) => {
  const s = g['work-summary'][0];
  const ids = Object.fromEntries((s['external-ids']?.['external-id'] ?? []).map((i) => [i['external-id-type'], i['external-id-value']]));
  const doi = (ids.doi ?? '').toLowerCase();
  const journal = s['journal-title']?.value ?? null;
  return {
    title: s.title.title.value,
    year: Number(s['publication-date']?.year?.value) || null,
    journal,
    doi,
    preprint: !journal || journal === 'bioRxiv' || isPreprintDoi(doi),
  };
}).filter((p) => p.doi && !hidden.has(p.doi) && !p.doi.includes('cassyni'));

// Papers missing from ORCID, listed in publication-overrides.yaml; Crossref fills in the details below
for (const doi of (overrides.add ?? []).map((d) => d.toLowerCase())) {
  if (!items.some((p) => p.doi === doi)) items.push({ title: doi, year: null, journal: null, doi, preprint: false });
}

// 2. De-duplicate: the same paper often appears as preprint + journal article
const key = (t) => t.toLowerCase().replace(/[^a-z]/g, '').slice(0, 45);
const byKey = new Map();
for (const p of items) {
  const k = key(p.title);
  const prev = byKey.get(k);
  if (!prev || (prev.preprint && !p.preprint)) byKey.set(k, p);
}
let pubs = [...byKey.values()];

// 3. Crossref: clean titles, journal names and author lists
for (const p of pubs) {
  const r = await getJSON(`https://api.crossref.org/works/${encodeURIComponent(p.doi)}`);
  await sleep(250);
  if (!r) continue;
  const m = r.message;
  p.title = (m.title?.[0] ?? p.title).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  p.journal = p.journal ?? m['container-title']?.[0] ?? m.institution?.[0]?.name ?? null;
  p.preprint = m.type === 'posted-content' || isPreprintDoi(p.doi);
  p.year = p.year ?? m.issued?.['date-parts']?.[0]?.[0] ?? null;
  p.authors = (m.author ?? []).map((a) => {
    const initials = (a.given ?? '').split(/[\s.-]+/).filter(Boolean).map((x) => x[0]).join('');
    return `${a.family ?? a.name ?? ''} ${initials}`.trim();
  });
}
for (const p of pubs) {
  if (p.doi.startsWith('10.64898') || p.doi.startsWith('10.1101')) p.journal = 'bioRxiv';
  if (p.doi.includes('preprints')) p.journal = 'Preprints.org';
  p.journal = journalNames[p.journal] ?? p.journal?.replace(/ \(New York, N\.Y\.\)$/, '');
}

// 4. OpenAlex: per-paper citation counts
for (let i = 0; i < pubs.length; i += 40) {
  const chunk = pubs.slice(i, i + 40);
  const filter = chunk.map((p) => `https://doi.org/${p.doi}`).join('|');
  const r = await getJSON(`https://api.openalex.org/works?per-page=50&filter=doi:${filter}`);
  const cites = new Map(r.results.map((w) => [w.doi.replace('https://doi.org/', '').toLowerCase(), w.cited_by_count]));
  for (const p of chunk) p.cites = cites.get(p.doi) ?? null;
}

pubs.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));
// Never replace good data with a partial response from a flaky API
const pubsPath = new URL('src/data/publications.json', root);
const previous = JSON.parse(await readFile(pubsPath, 'utf8').catch(() => '{"items":[]}'));
if (pubs.length < previous.items.length * 0.8) {
  console.warn(`publications.json: kept existing file (${pubs.length} works fetched vs ${previous.items.length} before)`);
} else {
  await writeFile(pubsPath, JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), items: pubs }, null, 1) + '\n');
  console.log(`publications.json: ${pubs.length} works`);
}

// 5. Bioconductor downloads for TaxSEA
const years = {};
try {
  const res = await fetch('https://bioconductor.org/packages/stats/bioc/TaxSEA/TaxSEA_stats.tab', { headers: UA });
  const tab = res.ok ? await res.text() : '';
  for (const line of tab.trim().split('\n').slice(1)) {
    const [year, month, ips, downloads] = line.split('\t');
    if (month === 'all' && /^\d{4}$/.test(year) && Number(downloads) > 0) years[year] = { distinct_ips: Number(ips), downloads: Number(downloads) };
  }
} catch (err) {
  console.warn(`bioconductor: request failed (${err.message})`);
}
if (Object.keys(years).length) {
  await writeFile(new URL('src/data/bioconductor.json', root), JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), package: 'TaxSEA', years }, null, 1) + '\n');
  console.log('bioconductor.json: updated');
} else {
  console.warn('bioconductor.json: no download data returned, kept existing file');
}
