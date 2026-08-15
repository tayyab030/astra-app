import type { CurrentUser } from '@/lib/api/user';
import { fetchCurrentUser } from '@/lib/api/user';
import { fetchWealthDashboard } from '@/lib/api/wealth';

import { formatWealthAmount, formatWealthDashboard } from './wealthContext';

function honorificForGender(gender: string | null | undefined) {
  const value = (gender || '').toLowerCase().trim();
  if (value === 'male') return 'sir';
  if (value === 'female') return "ma'am";
  return null;
}

function formatUserContext(user: CurrentUser) {
  const first = (user.first_name || '').trim();
  const last = (user.last_name || '').trim();
  const fullName = [first, last].filter(Boolean).join(' ') || user.username;
  const honorific = honorificForGender(user.gender);
  const currency = (user.currency || 'USD').trim().toUpperCase() || 'USD';
  const example = formatWealthAmount(21, currency);

  const lines = [
    'USER CONTEXT (live profile from GET /auth/me/).',
    `User id: ${user.id}`,
    `Full name: ${fullName}`,
    `First name: ${first || 'unknown'}`,
    `Last name: ${last || 'unknown'}`,
    `Username: ${user.username}`,
    `Email: ${user.email}`,
    `Gender: ${user.gender || 'unknown'}`,
    honorific
      ? `Preferred address: use "${honorific}" when formal (e.g. "Yes, ${honorific}"). You may also use their first name "${first || fullName}" when warmer.`
      : `Preferred address: do not use sir/ma'am. Use their first name "${first || fullName}" or full name "${fullName}".`,
    `Currency: ${currency} (format amounts like "${example}")`,
    `Country: ${user.country || 'unknown'}`,
    `Timezone: ${user.timezone || 'UTC'}`,
    `Theme preference: ${user.theme || 'neon'}`,
  ];

  return lines.join('\n');
}

/**
 * Builds live assistant context: full user profile + current-month wealth.
 */
export async function buildAssistantContext(): Promise<string | null> {
  try {
    const now = new Date();
    const [user, dashboard] = await Promise.all([
      fetchCurrentUser(),
      fetchWealthDashboard({
        mode: 'month',
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      }),
    ]);

    const currency = (user.currency || 'USD').trim().toUpperCase() || 'USD';
    const wealthBlock = [
      'WEALTH CONTEXT (live data from the user Astra wealth module).',
      'Use only these figures for wealth questions. Do not invent missing numbers.',
      'Net worth here means all-time income minus all-time expenses in Astra.',
      `All amounts use the user currency ${currency}.`,
      formatWealthDashboard(dashboard, currency),
    ].join('\n');

    return [formatUserContext(user), wealthBlock].join('\n\n');
  } catch {
    return null;
  }
}
