/**
 * Generates public/sitemap.xml from the list of rule IDs.
 * Run after build: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://www.primolingo.fr';
const today = new Date().toISOString().slice(0, 10);

// Read rule IDs from content/rules/*.json
const rulesDir = join(__dirname, '../src/content/rules');
const ruleIds = readdirSync(rulesDir)
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace('.json', ''));

const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/regles', priority: '0.9', changefreq: 'monthly' },
  { url: '/legal', priority: '0.3', changefreq: 'yearly' },
];

const ruleRoutes = ruleIds.map(id => ({
  url: `/regles/${id}`,
  priority: '0.8',
  changefreq: 'monthly',
}));

const allRoutes = [...staticRoutes, ...ruleRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(r => `  <url>
    <loc>${BASE}${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = join(__dirname, '../public/sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`✅ Sitemap generated: ${allRoutes.length} URLs → public/sitemap.xml`);
