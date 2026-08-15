/** @type {import('expo/config').ConfigContext['config']} */
module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins ?? []), 'expo-audio'],
  extra: {
    ...(config.extra ?? {}),
  },
});
