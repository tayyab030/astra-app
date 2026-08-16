/**
 * Fix remaining theme migration issues + migrate TaskCalendarView.
 */
import fs from 'fs';

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

function migrateTaskCalendar() {
  const file = 'src/features/tasks/detail/TaskCalendarView.tsx';
  let src = fs.readFileSync(file, 'utf8');
  const sheet = extractStyleSheetCreate(src);
  if (!sheet) throw new Error('no sheet');

  let out =
    src.slice(0, sheet.fullStart).replace(/\s+$/, '\n') +
    src.slice(sheet.fullEnd).replace(/^\s+/, '\n');

  out = out.replace(
    /import \{ colors, fonts \} from '@\/constants\/theme';/,
    `import { fonts } from '@/constants/theme';\nimport type { ThemedPalette } from '@/constants/theme-tokens';\nimport { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';`,
  );

  out = out.replace(
    /import \{([^}]*)\} from 'react-native'/,
    (_, inner) => {
      const parts = inner
        .split(',')
        .map((s) => s.trim())
        .filter((n) => n && n !== 'StyleSheet');
      return `import { ${parts.join(', ')} } from 'react-native'`;
    },
  );

  out = out.replace(
    /function priorityColor\(priority: string, completed\?: boolean\) \{/,
    'function priorityColor(priority: string, completed: boolean | undefined, colors: ThemedPalette) {',
  );

  // Inject at start of TaskCalendarView
  out = out.replace(
    /export function TaskCalendarView\(\{ tasks, onEditTask \}: TaskCalendarViewProps\) \{/,
    `export function TaskCalendarView({ tasks, onEditTask }: TaskCalendarViewProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => (${sheet.body}));`,
  );

  // Update priorityColor call sites
  out = out.replace(/priorityColor\(([^)]+)\)/g, (full, args) => {
    if (args.includes('colors') || args.includes('ThemedPalette')) return full;
    // skip function definition
    if (full.includes('function')) return full;
    return `priorityColor(${args.trim()}, colors)`;
  });

  // Fix accidental change to function signature if any
  out = out.replace(
    /function priorityColor\(priority: string, completed: boolean \| undefined, colors: ThemedPalette, colors\)/,
    'function priorityColor(priority: string, completed: boolean | undefined, colors: ThemedPalette)',
  );

  fs.writeFileSync(file, out);
  console.log('TaskCalendarView migrated');
}

function fixImportNewlines() {
  const files = [
    'src/features/habits/components/HabitRow.tsx',
    'src/features/tasks/TaskRow.tsx',
  ];
  for (const file of files) {
    let t = fs.readFileSync(file, 'utf8');
    t = t.replace(/';import /g, ';\nimport ');
    fs.writeFileSync(file, t);
    console.log('fixed newlines', file);
  }
}

function fixGlobalToast() {
  const file = 'src/components/GlobalToast.tsx';
  let t = fs.readFileSync(file, 'utf8');
  t = t.replace(
    /import \{ StyleSheet, Text, View \} from 'react-native';/,
    "import { Text, View } from 'react-native';",
  );
  t = t.replace(
    /const \{ tokens, colors \} = useAppTheme\(\);\n/,
    '',
  );
  // if useAppTheme unused, remove from import
  if (!/useAppTheme\(/.test(t)) {
    t = t.replace(
      /import \{ useAppTheme, useThemedStyles \}/,
      'import { useThemedStyles }',
    );
  }
  fs.writeFileSync(file, t);
  console.log('GlobalToast fixed');
}

function fixSettingsScreen() {
  const file = 'src/features/settings/SettingsScreen.tsx';
  let t = fs.readFileSync(file, 'utf8');
  // Merge duplicate useAppTheme — change first to include setTheme
  if (/const \{ colors, tokens \} = useAppTheme\(\);/.test(t) && /const \{ setTheme \} = useAppTheme\(\);/.test(t)) {
    t = t.replace(
      /const \{ colors, tokens \} = useAppTheme\(\);/,
      'const { colors, tokens, setTheme } = useAppTheme();',
    );
    t = t.replace(/\n\s*const \{ setTheme \} = useAppTheme\(\);\n/, '\n');
  }
  // Remove StyleSheet from import if unused
  if (!/StyleSheet\./.test(t)) {
    t = t.replace(
      /import \{\n([^}]*)\} from 'react-native'/,
      (full, inner) => {
        const parts = inner
          .split(',')
          .map((s) => s.trim())
          .filter((n) => n && n !== 'StyleSheet');
        return `import {\n  ${parts.join(',\n  ')}\n} from 'react-native'`;
      },
    );
  }
  fs.writeFileSync(file, t);
  console.log('SettingsScreen fixed');
}

function stripUnusedStyleSheetImports() {
  // walk src for StyleSheet import without StyleSheet. usage
  function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${ent.name}`;
      if (ent.isDirectory()) walk(p, out);
      else if (/\.tsx?$/.test(ent.name)) out.push(p);
    }
    return out;
  }
  let n = 0;
  for (const file of walk('src')) {
    let t = fs.readFileSync(file, 'utf8');
    if (!/\bStyleSheet\b/.test(t)) continue;
    if (/StyleSheet\./.test(t)) continue;
    const before = t;
    t = t.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]react-native['"]/,
      (full, inner) => {
        if (!/\bStyleSheet\b/.test(inner)) return full;
        const parts = inner
          .split(',')
          .map((s) => s.trim())
          .filter((x) => x && x !== 'StyleSheet');
        if (!parts.length) return '';
        return `import { ${parts.join(', ')} } from 'react-native'`;
      },
    );
    if (t !== before) {
      fs.writeFileSync(file, t);
      n++;
    }
  }
  console.log('stripped StyleSheet imports from', n, 'files');
}

migrateTaskCalendar();
fixImportNewlines();
fixGlobalToast();
fixSettingsScreen();
stripUnusedStyleSheetImports();
