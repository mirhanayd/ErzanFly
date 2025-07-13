module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-paper|react-native-linear-gradient|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-navigation|react-native-svg|react-native-chart-kit|react-native-date-picker|@react-native-async-storage)/)',
  ],
  moduleNameMapping: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
  },
};