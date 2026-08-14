/** @type {import('expo/config').ConfigContext['config']} */
module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins ?? []), 'expo-audio'],
  extra: {
    ...(config.extra ?? {}),
    consoleGroqApiKey: process.env.CONSOLE_GROQ_API_KEY ?? '',
  },
});
