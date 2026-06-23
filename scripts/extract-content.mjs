/**
 * Build-time content extraction (run once during migration, re-run if PHP
 * blog sources change). Uses the real PHP renderer so the captured HTML is
 * byte-identical to what the old server produced, then rewrites paths for Next.
 *
 *   node scripts/extract-content.mjs
 *
 * Outputs:
 *   content/blogs/<slug>.json   — one per static post {meta + bodyHtml}
 *   content/blogs/_slugs.json   — list of static slugs
 *   content/blogIndexPosts.json — the allPosts array for /blogs
 *   content/chaicodePosts.json  — the allPosts array for /chaicode
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const PHP_ROOT = join(import.meta.dirname, '..', '..'); // repo root (PHP site)
const BLOGS_DIR = join(PHP_ROOT, 'blogs');
const OUT = join(import.meta.dirname, '..', 'content');
const OUT_BLOGS = join(OUT, 'blogs');
mkdirSync(OUT_BLOGS, { recursive: true });

const renderPhp = (file) =>
  execFileSync('php', [file], { cwd: PHP_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// "../foo" → "/foo", href="index" → "/blogs" etc. Body-only rewrites.
function fixPaths(html) {
  return html
    .replace(/(src|href)="\.\.\//g, '$1="/')
    .replace(/(src|href)='\.\.\//g, "$1='/")
    .replace(/href="index"/g, 'href="/blogs"')
    .replace(/href='index'/g, "href='/blogs'")
    .replace(/href="\.\."/g, 'href="/')
    .replace(/href="\."/g, 'href="/blogs"');
}

const pick = (re, html) => { const m = html.match(re); return m ? m[1].trim() : ''; };

function extractMeta(html) {
  return {
    title: pick(/<title>([\s\S]*?)<\/title>/i, html),
    description: pick(/<meta\s+name="description"\s+content="([\s\S]*?)"/i, html),
    keywords: pick(/<meta\s+name="keywords"\s+content="([\s\S]*?)"/i, html),
    ogTitle: pick(/<meta\s+property="og:title"\s+content="([\s\S]*?)"/i, html),
    ogDescription: pick(/<meta\s+property="og:description"\s+content="([\s\S]*?)"/i, html),
    ogImage: pick(/<meta\s+property="og:image"\s+content="([\s\S]*?)"/i, html),
    ogUrl: pick(/<meta\s+property="og:url"\s+content="([\s\S]*?)"/i, html),
  };
}

// The PHP include puts the loader + chrome INSIDE #home.home, but the subpage
// CSS hides `.home` with opacity:0 until `.is-ready` and opacity inherits to
// fixed children — so a nested loader is itself invisible during load (blank
// screen, then a snap). Hoist the loader + chrome out to before #home so the
// reveal stays smooth (matches the projects page + SubShell).
function hoistLoader(body) {
  const headerIdx = body.indexOf('<header class="site-header"');
  const marker = '<div class="homeContainer">';
  const cOpen = body.indexOf(marker);
  if (headerIdx < 0 || cOpen < 0 || cOpen > headerIdx) return body;
  const cEnd = cOpen + marker.length;
  const loaderChrome = body.slice(cEnd, headerIdx).trim();
  return loaderChrome + '\n' + body.slice(0, cEnd) + body.slice(headerIdx);
}

function extractBody(html) {
  let body = pick(/<body[^>]*>([\s\S]*?)<\/body>/i, html);
  body = body.replace(/<script[\s\S]*?<\/script>/gi, ''); // Next re-adds scripts
  return fixPaths(hoistLoader(body)).trim();
}

// ---- static blog posts ----
const slugs = [];
for (const f of readdirSync(BLOGS_DIR)) {
  if (!f.endsWith('.php')) continue;
  if (f === 'index.php' || f === 'post.php') continue;
  const slug = basename(f, '.php');
  const html = renderPhp(join(BLOGS_DIR, f));
  const data = { slug, ...extractMeta(html), bodyHtml: extractBody(html) };
  writeFileSync(join(OUT_BLOGS, `${slug}.json`), JSON.stringify(data));
  slugs.push(slug);
  console.log('blog:', slug);
}
writeFileSync(join(OUT_BLOGS, '_slugs.json'), JSON.stringify(slugs, null, 2));

// ---- allPosts arrays injected into the index pages ----
function extractAllPosts(file) {
  const html = renderPhp(file);
  const m = html.match(/const allPosts\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error('allPosts not found in ' + file);
  const arr = JSON.parse(m[1]);
  // image/link paths were emitted relative to the page dir ("../") → site root
  for (const p of arr) {
    if (typeof p.image === 'string') p.image = p.image.replace(/^\.\.\//, '/');
  }
  return arr;
}
writeFileSync(join(OUT, 'blogIndexPosts.json'), JSON.stringify(extractAllPosts(join(BLOGS_DIR, 'index.php')), null, 2));
writeFileSync(join(OUT, 'chaicodePosts.json'), JSON.stringify(extractAllPosts(join(PHP_ROOT, 'chaicode', 'index.php')), null, 2));
console.log('done.');
