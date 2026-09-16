# feargalryan.com

Personal academic website of Dr Feargal J. Ryan, built with [Astro](https://astro.build) and hosted on GitHub Pages.

## Editing content

Almost everything on the site comes from the files in `src/data/`. Edit these, then commit and push; the site rebuilds itself in about a minute.

| File | What it controls |
| --- | --- |
| `site.yaml` | Name, headline, roles, bio, photo, profile links, contact form |
| `research.yaml` | The four research programs, impact notes and key papers |
| `software.yaml` | TaxSEA and OpusTaxa pages, plus the smaller tools |
| `talks.yaml` | Talks (newest first) |
| `community.yaml` | ABACBS and other service |
| `cv.yaml` | Appointments, education, awards, funding |
| `publication-overrides.yaml` | Papers to hide from the ORCID sync, journal name fixes |

Generated automatically, don't edit by hand:

| File | Source | How it updates |
| --- | --- | --- |
| `publications.json` | ORCID, Crossref, OpenAlex | GitHub Action, 1st of each month |
| `bioconductor.json` | Bioconductor download stats | GitHub Action, 1st of each month |
| `scholar.json` | Google Scholar | You run `Rscript scripts/update-scholar.R` locally (Scholar blocks GitHub's servers) |

Words wrapped in `*asterisks*` in the YAML files are shown in italics (for journal names).

## Running it on your computer

Node.js lives in a conda environment at `~/.local/envs/node`. Add it to your PATH first:

```bash
export PATH="$HOME/.local/envs/node/bin:$PATH"
```

Then, from this folder:

```bash
npm install          # first time only
npm run dev          # live preview at http://localhost:4321
npm run build        # production build into dist/
npm run update-data  # refresh publications and download stats now
```

## Going live

1. Create a GitHub repository named `feargalr.github.io` and push this folder to it.
2. In the repository: Settings → Pages → Source: **GitHub Actions**.
3. The site builds and appears at `https://feargalr.github.io`. Check it there first.
4. Set up the contact form: create a free form at [formspree.io](https://formspree.io), then paste its URL into `contact.form_endpoint` in `src/data/site.yaml`.
5. Point the domain:
   - At your domain registrar, add four `A` records for `feargalryan.com`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Add a `CNAME` record for `www` pointing to `feargalr.github.io`.
   - Create `public/CNAME` containing `feargalryan.com`, commit and push.
   - In Settings → Pages, set the custom domain to `feargalryan.com` and tick **Enforce HTTPS** once the certificate is ready.
   - In your GitHub account settings → Pages, verify the domain so no one else can claim it.
6. Register the site in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters), and submit `https://feargalryan.com/sitemap-index.xml`.

Note: with a custom domain on `feargalr.github.io`, project sites like the TaxSEA docs move from `feargalr.github.io/TaxSEA` to `feargalryan.com/TaxSEA`. GitHub redirects the old links automatically.

## For search engines and LLMs

- Every page carries schema.org structured data (`Person`, `ScholarlyArticle`, `SoftwareSourceCode`).
- `/sitemap-index.xml` is generated on each build.
- `/robots.txt` allows all crawlers, including AI crawlers.
- `/llms.txt` (summary) and `/llms-full.txt` (everything, including all publications) are generated from the same data files.
