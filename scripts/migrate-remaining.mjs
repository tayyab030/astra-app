/**
 * Migrate remaining files that still use static colors + StyleSheet.create.
 * Only injects into PascalCase components.
 */
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

function findMatchingBrace(src, openIdx) {
  let depth = 0;
  let inStr = null;
  let escape = false;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      i = src.indexOf('\n', i);
      if (i < 0) return -1;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2);
      if (i < 0) return -1;
      i += 1;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractStyleSheetCreate(src) {
  const match = /const\s+styles\s*=\s*StyleSheet\.create\s*\(/.exec(src);
  if (!match) return null;
  let i = match.index + match[0].length;
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] !== '{') return null;
  const bodyStart = i;
  const bodyEnd = findMatchingBrace(src, bodyStart);
  if (bodyEnd < 0) return null;
  let j = bodyEnd + 1;
  while (j < src.length && /\s/.test(src[j])) j++;
  if (src[j] !== ')') return null;
  j++;
  while (j < src.length && /\s/.test(src[j])) j++;
  if (src[j] === ';') j++;
  return { fullStart: match.index, fullEnd: j, body: src.slice(bodyStart, bodyEnd + 1) };
}

function needsStyleSheet(body) {
  return /StyleSheet\.(absoluteFill|absoluteFillObject|flatten|hairlineWidth)/.test(body);
}

function migrateFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  const rel = path.relative('.', file).replace(/\\/g, '/');

  if (rel === 'src/features/health/constants.ts') {
    return { status: 'skip', reason: 'module constants / mood status accents' };
  }
  if (rel === 'src/app/_layout.tsx') {
    return { status: 'skip', reason: 'already themed via provider; splash bootstrap only' };
  }

  const themeImp = src.match(/import\s*\{([^}]*)\}\s*from\s*['"]@\/constants\/theme['"]/);
  if (!themeImp || !/\bcolors\b/.test(themeImp[1])) {
    return { status: 'skip', reason: 'no colors import' };
  }

  // Already fully on useThemedStyles without StyleSheet.create
  if (/useThemedStyles/.test(src) && !/StyleSheet\.create/.test(src)) {
    return { status: 'skip', reason: 'already migrated' };
  }

  const sheet = extractStyleSheetCreate(src);
  if (!sheet) {
    // Inline-only colors usage
    return migrateInline(file, src);
  }

  const styleBody = sheet.body;
  const keepSheet = needsStyleSheet(styleBody) || needsStyleSheet(src.slice(0, sheet.fullStart));

  let out =
    src.slice(0, sheet.fullStart).replace(/\s+$/, '\n') +
    src.slice(sheet.fullEnd).replace(/^\s+/, '\n');

  // Update theme import
  out = out.replace(
    /import\s*\{([^}]*)\}\s*from\s*['"]@\/constants\/theme['"]\s*;?/,
    (_, inner) => {
      const names = inner
        .split(',')
        .map((s) => s.trim())
        .filter((n) => n && n !== 'colors');
      return names.length
        ? `import { ${names.join(', ')} } from '@/constants/theme';`
        : '';
    },
  );

  if (!/AppThemeProvider/.test(out)) {
    out = out.replace(
      /import\s*\{[^}]*\}\s*from\s*['"]@\/constants\/theme['"]\s*;?\n?/,
      (m) =>
        `${m}import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';\n`,
    );
    if (!/AppThemeProvider/.test(out)) {
      out = out.replace(
        /(import[^\n]+\n)/,
        `$1import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';\n`,
      );
    }
  } else if (!/useThemedStyles/.test(out)) {
    out = out.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]@\/features\/theme\/AppThemeProvider['"]/,
      (_, inner) => {
        const parts = inner
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (!parts.includes('useAppTheme')) parts.push('useAppTheme');
        if (!parts.includes('useThemedStyles')) parts.push('useThemedStyles');
        return `import { ${parts.join(', ')} } from '@/features/theme/AppThemeProvider'`;
      },
    );
  }

  if (!keepSheet) {
    out = out.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]react-native['"]/,
      (_, inner) => {
        const parts = inner
          .split(',')
          .map((s) => s.trim())
          .filter((n) => n && n !== 'StyleSheet');
        return `import { ${parts.join(', ')} } from 'react-native'`;
      },
    );
  }

  // Shared hook for multi-component files
  const hookName = 'useLocalThemedStyles';
  const hookDef = `\nfunction ${hookName}() {\n  return useThemedStyles((colors, tokens) => (${styleBody}));\n}\n`;

  // Find PascalCase components
  const re = /(?:export\s+)?function\s+([A-Z][A-Za-z0-9_]*)\s*\([^)]*\)\s*\{/g;
  const comps = [];
  let m;
  while ((m = re.exec(out))) {
    const bodyStart = m.index + m[0].length - 1;
    const bodyEnd = findMatchingBrace(out, bodyStart);
    if (bodyEnd < 0) continue;
    const body = out.slice(bodyStart, bodyEnd + 1);
    if (!/\bstyles\./.test(body) && !/\bcolors\./.test(body)) continue;
    comps.push({ name: m[1], bodyStart, bodyEnd, body });
  }

  if (comps.length === 0) {
    return { status: 'fail', reason: 'no PascalCase component uses styles' };
  }

  // Insert shared hook before first component
  const firstCompStart = Math.min(...comps.map((c) => c.bodyStart));
  // find start of that function declaration
  let insertAt = out.lastIndexOf('function ' + comps.find((c) => c.bodyStart === firstCompStart).name, firstCompStart);
  // better: insert after imports / before first matched function keyword
  const firstFn = /(?:export\s+)?function\s+[A-Z]/.exec(out);
  if (firstFn && !out.includes(`function ${hookName}`)) {
    out = out.slice(0, firstFn.index) + hookDef + out.slice(firstFn.index);
  }

  // Re-find components after insert
  const comps2 = [];
  re.lastIndex = 0;
  while ((m = re.exec(out))) {
    if (m[1] === hookName) continue;
    const bodyStart = m.index + m[0].length - 1;
    const bodyEnd = findMatchingBrace(out, bodyStart);
    if (bodyEnd < 0) continue;
    const body = out.slice(bodyStart, bodyEnd + 1);
    if (!/\bstyles\./.test(body) && !/\bcolors\./.test(body)) continue;
    comps2.push({ name: m[1], bodyStart, bodyEnd, body });
  }
  comps2.sort((a, b) => b.bodyStart - a.bodyStart);

  for (const comp of comps2) {
    let body = comp.body;
    if (/useThemedStyles|useLocalThemedStyles/.test(body)) continue;

    body = body.replace(
      /colors=\{\[\s*colors\.cyan500\s*,\s*colors\.blue600\s*\]\}/g,
      'colors={tokens.accentGradient}',
    );
    // ternary disabled gradient: keep themed slate colors via colors from useAppTheme
    body = body.replace(
      /colors=\{\s*sendDisabled\s*\?\s*\[\s*colors\.slate700\s*,\s*colors\.slate600\s*\]\s*:\s*\[\s*colors\.cyan500\s*,\s*colors\.blue600\s*\]\s*\}/g,
      'colors={sendDisabled ? [colors.slate700, colors.slate600] : tokens.accentGradient}',
    );

    const usesColors =
      /\bcolors\./.test(body) ||
      /\btokens\./.test(body) ||
      /tokens\.accentGradient/.test(body) ||
      /placeholderTextColor=\{colors/.test(body);

    const inner = body.slice(1, -1);
    const hooks = [];
    if (usesColors) {
      // Preserve existing setTheme destructure if present later — use full
      hooks.push('  const { colors, tokens } = useAppTheme();');
    }
    hooks.push(`  const styles = ${hookName}();`);
    const newBody = '{\n' + hooks.join('\n') + '\n' + inner + '}';
    out = out.slice(0, comp.bodyStart) + newBody + out.slice(comp.bodyEnd + 1);
  }

  // SettingsScreen: merge setTheme if now duplicate
  if (/const \{ colors, tokens \} = useAppTheme\(\);/.test(out) && /const \{ setTheme \} = useAppTheme\(\);/.test(out)) {
    out = out.replace(
      /const \{ colors, tokens \} = useAppTheme\(\);/,
      'const { colors, tokens, setTheme } = useAppTheme();',
    );
    out = out.replace(/\n\s*const \{ setTheme \} = useAppTheme\(\);\n/, '\n');
  }

  out = out.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(file, out);
  return { status: 'ok', comps: comps2.map((c) => c.name) };
}

function migrateInline(file, src) {
  // ProgressBar-like: default param colors.cyan400
  let out = src.replace(
    /import\s*\{([^}]*)\}\s*from\s*['"]@\/constants\/theme['"]\s*;?/,
    (_, inner) => {
      const names = inner
        .split(',')
        .map((s) => s.trim())
        .filter((n) => n && n !== 'colors');
      return names.length
        ? `import { ${names.join(', ')} } from '@/constants/theme';`
        : '';
    },
  );

  if (!/AppThemeProvider/.test(out)) {
    out = out.replace(
      /(import[^\n]+\n)/,
      `$1import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';\n`,
    );
  }

  // ProgressBar pattern: color = colors.cyan400 in params — move inside
  out = out.replace(
    /export function ProgressBar\(\{ value, color = colors\.cyan400 \}: ProgressBarProps\) \{/,
    `export function ProgressBar({ value, color }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const resolvedColor = color ?? colors.cyan400;`,
  );
  if (/resolvedColor/.test(out)) {
    out = out.replace(
      /backgroundColor: color \}/,
      'backgroundColor: resolvedColor }',
    );
  }

  const sheet = extractStyleSheetCreate(out);
  if (sheet) {
    // continue as normal migrate — rewrite file and recurse once
    fs.writeFileSync(file, out);
    return migrateFile(file);
  }

  // inject useAppTheme into PascalCase comps using colors
  const re = /(?:export\s+)?function\s+([A-Z][A-Za-z0-9_]*)\s*\([^)]*\)\s*\{/g;
  const comps = [];
  let m;
  while ((m = re.exec(out))) {
    const bodyStart = m.index + m[0].length - 1;
    const bodyEnd = findMatchingBrace(out, bodyStart);
    if (bodyEnd < 0) continue;
    const body = out.slice(bodyStart, bodyEnd + 1);
    if (!/\bcolors\./.test(body) && !/\bresolvedColor\b/.test(body)) continue;
    if (/useAppTheme/.test(body)) continue;
    comps.push({ bodyStart, bodyEnd, body });
  }
  comps.sort((a, b) => b.bodyStart - a.bodyStart);
  for (const c of comps) {
    const inner = c.body.slice(1, -1);
    const newBody = '{\n  const { colors } = useAppTheme();\n' + inner + '}';
    out = out.slice(0, c.bodyStart) + newBody + out.slice(c.bodyEnd + 1);
  }

  fs.writeFileSync(file, out);
  return { status: 'ok-inline' };
}

const targets = walk('src').filter((f) => {
  const t = fs.readFileSync(f, 'utf8');
  const m = t.match(/import\s*\{([^}]*)\}\s*from\s*['"]@\/constants\/theme['"]/);
  return m && /\bcolors\b/.test(m[1]);
});

const report = [];
for (const f of targets) {
  try {
    report.push({ file: path.relative('.', f).replace(/\\/g, '/'), ...migrateFile(f) });
  } catch (e) {
    report.push({
      file: path.relative('.', f).replace(/\\/g, '/'),
      status: 'fail',
      reason: String(e?.stack || e),
    });
  }
}
console.log(JSON.stringify(report, null, 2));
