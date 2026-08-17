import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p);
  }
  return out;
}

const still = [];
const noStylesHook = [];
for (const f of walk('src')) {
  const t = fs.readFileSync(f, 'utf8');
  const rel = path.relative('.', f).replace(/\\/g, '/');
  const m = t.match(/import\s*\{([^}]*)\}\s*from\s*['"]@\/constants\/theme['"]/);
  if (m && /\bcolors\b/.test(m[1])) still.push(rel);

  if (/StyleSheet\.create/.test(t) && /from ['"]@\/constants\/theme['"]/.test(t) && /\bcolors\b/.test(t)) {
    still.push(rel + ' (still StyleSheet.create+colors)');
  }
}
console.log('Still import colors:', still.length ? still.join('\n') : 'none');
