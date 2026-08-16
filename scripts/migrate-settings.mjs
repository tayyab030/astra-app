import fs from 'fs';

const file = 'src/features/settings/SettingsScreen.tsx';
let src = fs.readFileSync(file, 'utf8');

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

if (/useSettingsStyles/.test(src) || (/useThemedStyles/.test(src) && !/StyleSheet\.create/.test(src))) {
  console.log('already migrated');
  process.exit(0);
}

const match = /const\s+styles\s*=\s*StyleSheet\.create\s*\(/.exec(src);
if (!match) {
  console.error('no StyleSheet.create');
  process.exit(1);
}

let i = match.index + match[0].length;
while (i < src.length && /\s/.test(src[i])) i++;
const bodyStart = i;
const bodyEnd = findMatchingBrace(src, bodyStart);
let j = bodyEnd + 1;
while (j < src.length && /\s/.test(src[j])) j++;
if (src[j] !== ')') throw new Error('expected )');
j++;
while (j < src.length && /\s/.test(src[j])) j++;
if (src[j] === ';') j++;

const styleBody = src.slice(bodyStart, bodyEnd + 1);
let out =
  src.slice(0, match.index).replace(/\s+$/, '\n') +
  src.slice(j).replace(/^\s+/, '\n');

out = out.replace(
  /import \{ colors, fonts \} from '@\/constants\/theme';/,
  "import { fonts } from '@/constants/theme';",
);
out = out.replace(
  /import \{ useAppTheme \} from '@\/features\/theme\/AppThemeProvider';/,
  "import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';",
);
out = out.replace(
  /  StyleSheet,\n/,
  '',
);

const hook = `
function useSettingsStyles() {
  return useThemedStyles((colors, tokens) => (${styleBody}));
}

`;

out = out.replace(
  /type TabId = \(typeof TABS\)\[number\]\['id'\];\n\nexport function SettingsScreen/,
  `type TabId = (typeof TABS)[number]['id'];\n${hook}export function SettingsScreen`,
);

out = out.replace(
  /export function SettingsScreen\(\) \{/,
  `export function SettingsScreen() {
  const { colors, tokens, setTheme } = useAppTheme();
  const styles = useSettingsStyles();`,
);

out = out.replace(/\n\s*const \{ setTheme \} = useAppTheme\(\);\n/, '\n');

out = out.replace(
  /colors=\{\[colors\.cyan500, colors\.blue600\]\}/g,
  'colors={tokens.accentGradient}',
);

out = out.replace(
  /function FieldLabel\(\{ children \}: \{ children: string \}\) \{\n  return <Text style=\{styles\.fieldLabel\}>\{children\}<\/Text>;\n\}/,
  `function FieldLabel({ children }: { children: string }) {
  const styles = useSettingsStyles();
  return <Text style={styles.fieldLabel}>{children}</Text>;
}`,
);

fs.writeFileSync(file, out);
console.log('ok', {
  hasHook: out.includes('useSettingsStyles'),
  noSheet: !out.includes('StyleSheet.create'),
  hasTokens: out.includes('tokens.accentGradient'),
});
