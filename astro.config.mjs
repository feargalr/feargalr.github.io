import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  site: 'https://feargalryan.com',
  integrations: [sitemap()],
  vite: { plugins: [yaml()] },
});
