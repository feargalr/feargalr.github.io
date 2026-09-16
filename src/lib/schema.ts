import site from '../data/site.yaml';
import cv from '../data/cv.yaml';
import { plain } from './format';

const SITE = 'https://feargalryan.com';

export const personId = `${SITE}/#person`;

export function personSchema() {
  const p = site.profiles;
  return {
    '@type': 'Person',
    '@id': personId,
    name: site.name,
    alternateName: site.name_variants,
    honorificPrefix: site.honorific,
    honorificSuffix: site.postnominals,
    description: site.description,
    jobTitle: site.roles.map((r: any) => plain(`${r.lead} ${r.rest}`)).slice(0, 2).join('; '),
    image: `${SITE}${site.photo.src}`,
    url: `${SITE}/`,
    affiliation: site.affiliations.map((a: any) => ({ '@type': a.type, name: a.name })),
    alumniOf: { '@type': 'CollegeOrUniversity', name: site.alumni_of },
    knowsAbout: site.knows_about,
    award: cv.awards.map((a: any) => plain(`${a.title}, ${a.where} (${a.when})`)),
    memberOf: { '@type': 'Organization', name: 'Australian Bioinformatics and Computational Biology Society', url: 'https://www.abacbs.org' },
    sameAs: [`https://orcid.org/${p.orcid}`, p.scholar, p.github, p.linkedin, p.institution],
  };
}
