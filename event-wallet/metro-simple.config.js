const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Simplified metro config to avoid binding issues
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs', 'ts', 'tsx'];

// Disable source maps temporarily to speed up bundling and see errors faster
config.transformer.minifierConfig = {
  compress: false,
  mangle: false
};

// Extra node modules
config.resolver.extraNodeModules = {
  'react-native-url-polyfill': path.resolve(__dirname, 'node_modules/react-native-url-polyfill'),
  'react-native-gesture-handler': path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
};

module.exports = config;