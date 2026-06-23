/**
 * Splits the PHP CMS (vee/index.php) into static pieces for the Next route:
 *   styles/css/vee.css   — the inline <style> block
 *   public/js/vee-cms.js — the inline app <script> (minus SB_URL/SB_ANON consts,
 *                          which Next injects from env at runtime)
 *   content/vee-body.html — the <body> markup (login form + app shell)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const NEXT = join(import.meta.dirname, '..');
const src = readFileSync(join(ROOT, 'vee', 'index.php'), 'utf8');

const between = (s, a, b) => {
  const i = s.indexOf(a); const j = s.indexOf(b, i + a.length);
  if (i < 0 || j < 0) throw new Error(`markers not found: ${a} .. ${b}`);
  return s.slice(i + a.length, j);
};

// 1) CSS
const css = between(src, '<style>', '</style>').trim();
writeFileSync(join(NEXT, 'styles', 'css', 'vee.css'), css);

// 2) body markup (up to the first <script>)
const bodyFull = between(src, '<body>', '</body>');
const bodyInner = bodyFull.slice(0, bodyFull.indexOf('<script')).trim();
mkdirSync(join(NEXT, 'content'), { recursive: true });
writeFileSync(join(NEXT, 'content', 'vee-body.html'), bodyInner);

// 3) app script — the inline <script> after the Supabase UMD include
const umd = '@supabase/supabase-js';
const afterUmd = src.slice(src.indexOf(umd));
let app = between(afterUmd, '<script>', '</script>');
// drop the PHP-injected key consts; Next provides window.SB_URL / SB_ANON
app = app
  .split('\n')
  .filter((l) => !/const\s+SB_URL\s*=/.test(l) && !/const\s+SB_ANON\s*=/.test(l))
  .join('\n')
  .trim();
// the createClient line referenced the consts; point it at the injected globals
app = app.replace(
  /const\s+sb\s*=\s*window\.supabase\.createClient\([^)]*\)/,
  'const sb = window.supabase.createClient(window.SB_URL, window.SB_ANON)'
);
writeFileSync(join(NEXT, 'public', 'js', 'vee-cms.js'), app);

console.log('vee: css', css.length, 'body', bodyInner.length, 'app', app.length);
