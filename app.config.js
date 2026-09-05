/** @type {import('expo/config').ConfigContext['config']} */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    'expo-audio',
    'expo-image',
    '@react-native-community/datetimepicker',
  ],
  extra: {
    ...(config.extra ?? {}),
  },
});
