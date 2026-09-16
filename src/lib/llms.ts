import site from '../data/site.yaml';
import research from '../data/research.yaml';
import software from '../data/software.yaml';
import talks from '../data/talks.yaml';
import community from '../data/community.yaml';
import cv from '../data/cv.yaml';
import scholar from '../data/scholar.json';
import pubs from '../data/publications.json';
import { plain } from './format';

const SITE = 'https://feargalryan.com';
const p = site.profiles;

export function llmsSummary() {
  return [
    `# ${site.name}, ${site.postnominals}`,
    '',
    `> ${site.description}`,
    '',
    plain(site.bio),
    '',
    `Also published as: ${site.name_variants.join(', ')}.`,
    `Current roles: ${site.roles.map((r: any) => plain(`${r.lead} ${r.rest}`)).join('; ')}.`,
    `Expertise: ${site.knows_about.join(', ')}.`,
    `Google Scholar (${scholar.retrieved}): ${scholar.citations} citations, h-index ${scholar.h_index}.`,
    '',
    '## Pages',
    `- [Research](${SITE}/research/): ${research.map((r: any) => r.title).join('; ')}`,
    `- [Software & methods](${SITE}/software/): ${software.featured.map((t: any) => `${t.name} (${t.tagline})`).join('; ')}`,
    `- [Publications](${SITE}/publications/): all ${pubs.items.length} publications`,
    `- [Talks](${SITE}/talks/)`,
    `- [Community & service](${SITE}/community/)`,
    `- [CV](${SITE}/cv/)`,
    `- [Contact](${SITE}/contact/)`,
    `- [Full text for LLMs](${SITE}/llms-full.txt)`,
    '',
    '## Profiles',
    `- ORCID: https://orcid.org/${p.orcid}`,
    `- Google Scholar: ${p.scholar}`,
    `- GitHub: ${p.github}`,
    `- LinkedIn: ${p.linkedin}`,
    `- Flinders University: ${p.institution}`,
    '',
  ].join('\n');
}

export function llmsFull() {
  const out = [llmsSummary(), '## Research programs', ''];
  for (const r of research) {
    out.push(`### ${r.title}`, plain(r.summary), `Impact: ${plain(r.impact)}`);
    r.papers.forEach((x: any) => out.push(`- ${x.title}. ${x.venue}, ${x.year}. https://doi.org/${x.doi}`));
    out.push('');
  }
  out.push('## Software', '');
  for (const t of software.featured) {
    out.push(`### ${t.name}`, plain(t.about), `Install: ${t.install}`, `Repository: ${t.repo}`, `Cite: ${t.paper.citation} https://doi.org/${t.paper.doi}`, '');
  }
  const s = software.spotlight;
  out.push('', '## More tools & best practice', '');
  out.push(`- ${s.title}. ${s.venue}, ${s.year}. https://doi.org/${s.doi}. ${plain(s.summary)}`);
  software.more.forEach((m: any) => out.push(`- ${m.name} (${m.note}): ${m.description} ${m.links.map((l: any) => l.url).join(' ')}`));
  out.push('', '## Appointments');
  cv.appointments.forEach((a: any) => out.push(`- ${a.when} ${a.title}, ${a.where}`));
  out.push('', '## Education');
  cv.education.forEach((a: any) => out.push(`- ${a.when} ${a.title}, ${a.where}`));
  out.push('', '## Awards');
  cv.awards.forEach((a: any) => out.push(`- ${a.when} ${a.title}, ${plain(a.where)}`));
  out.push('', '## Service');
  out.push(`- ${community.abacbs.role} (${community.abacbs.org}). ${community.abacbs.paragraphs.map(plain).join(' ')}`);
  community.service.forEach((s: any) => out.push(`- ${s.title}: ${plain(s.detail)}`));
  out.push('', '## Talks');
  talks.forEach((t: any) => out.push(`- ${t.date}: ${t.event}${t.location ? `, ${t.location}` : ''} (${t.type})`));
  out.push('', '## Publications');
  pubs.items.forEach((x: any) => out.push(`- ${(x.authors ?? []).join(', ')}. ${x.title}. ${x.journal ?? ''}${x.preprint ? ' (preprint)' : ''}, ${x.year}. https://doi.org/${x.doi}`));
  return out.join('\n') + '\n';
}
