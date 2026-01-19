const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// CRITICAL: Inject Buffer polyfill at bundle level
// This runs BEFORE any other modules to ensure Buffer is available during module evaluation
config.serializer = {
  getModulesRunBeforeMainModule: (entryPoint) => {
    // Use absolute path for the polyfill file
    return [path.resolve(__dirname, 'buffer-polyfill-prelude.js')];
  },
};

// Fix for Web3Auth's nested react-native-url-polyfill module resolution issue
// Web3Auth SDK has nested node_modules which causes Metro to fail resolving imports
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add extraNodeModules to force resolution of problematic modules to top-level
// This prevents Metro from resolving to nested node_modules within Web3Auth SDK
// CRITICAL: Must include polyfill modules so Metro's resolver knows how to resolve them
config.resolver.extraNodeModules = {
  'react-native-url-polyfill': path.resolve(__dirname, 'node_modules/react-native-url-polyfill'),
  'react-native-gesture-handler': path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
  'react-native-get-random-values': path.resolve(__dirname, 'node_modules/react-native-get-random-values'),
  'react-native-buffer': path.resolve(__dirname, 'node_modules/react-native-buffer'),
  // Node.js polyfills for Web3Auth crypto dependencies
  'crypto': path.resolve(__dirname, 'node_modules/crypto-browserify'),
  'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
  'events': path.resolve(__dirname, 'node_modules/events'),
  // IMPORTANT: 'buffer' must resolve to top-level to ensure consistent Buffer implementation
  // across all crypto dependencies (safe-buffer, randombytes, etc.)
  'buffer': path.resolve(__dirname, 'node_modules/buffer'),
  // CRITICAL: 'randombytes' must resolve to top-level to use browser.js implementation
  'randombytes': path.resolve(__dirname, 'node_modules/randombytes'),
  'safe-buffer': path.resolve(__dirname, 'node_modules/safe-buffer'),
};

// Block list to prevent Metro from bundling nested node_modules
config.resolver.blockList = [
  // Exclude nested node_modules within Web3Auth packages
  /node_modules\/@web3auth\/.*\/node_modules\/.*/,
  // Exclude nested node_modules within Torus Labs packages
  /node_modules\/@toruslabs\/.*\/node_modules\/.*/,
];

// Add watchFolders for monorepo support
config.watchFolders = [path.resolve(__dirname)];

// Increase the max number of workers for better performance
config.maxWorkers = 2;

// Add server options for better development experience
config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Allow cross-origin requests for development
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
