// Regenerates sitemap.xml from the published pages (every tracked .html file except the 404),
// with <lastmod> taken from each file's last commit. Run from the repo root:
//   node scripts/generate-sitemap.mjs
// The deploy workflow runs it too (with full git history, so dates are real).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SITE = (process.env.SITE_URL || 'https://codilated.com').replace(/\/+$/, '');
const root = fileURLToPath(new URL('..', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

const EXCLUDE = [/^404\.html$/, /^server\//, /^scripts\//, /^wp-/, /^forms\//];
// Core pages from the brief get a higher priority; everything else is a normal content page.
const PRIORITY = {
	'/': '1.0',
	'/about': '0.9',
	'/contact': '0.9',
	'/services/branding-design': '0.9',
	'/services/shopify-ecommerce': '0.9',
	'/services/web-development': '0.9',
	'/services/ai-automation': '0.9',
	'/services/': '0.8',
	'/portfolio/': '0.8',
	'/blog/': '0.8'
};

function urlPath(file) {
	if (file === 'index.html') return '/';
	if (file.endsWith('/index.html')) return '/' + file.slice(0, -'index.html'.length);
	return '/' + file.replace(/\.html$/, '');
}

const today = new Date().toISOString().slice(0, 10);
const files = git('ls-files', '*.html').split('\n').filter((f) => f && !EXCLUDE.some((re) => re.test(f)));
const entries = files
	.map((file) => {
		const path = urlPath(file);
		let lastmod = '';
		try { lastmod = git('log', '-1', '--format=%cs', '--', file); } catch { /* not committed yet */ }
		return { path, lastmod: lastmod || today, priority: PRIORITY[path] || '0.6' };
	})
	.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : a.path.localeCompare(b.path)));

const xml =
	'<?xml version="1.0" encoding="UTF-8"?>\n' +
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
	entries.map((e) => `  <url><loc>${SITE}${e.path}</loc><lastmod>${e.lastmod}</lastmod><priority>${e.priority}</priority></url>`).join('\n') +
	'\n</urlset>\n';

writeFileSync(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml: ${entries.length} URLs`);
