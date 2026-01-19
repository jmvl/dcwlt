// Polyfills for React Native crypto operations
// IMPORTANT: Must be imported first in App.tsx before any other imports

// Step 1: Initialize Web Crypto API polyfill FIRST
import 'react-native-get-random-values';

// Step 2: Setup Buffer from npm 'buffer' package
// CRITICAL: This must be done BEFORE any other crypto-related imports
// Using require instead of import to ensure it's available globally
const BufferPolyfill = require('buffer').Buffer;

// Set Buffer globally IMMEDIATELY - before ANY other code runs
if (typeof (global as any) === 'undefined') {
  (global as any) = {};
}
(global as any).Buffer = BufferPolyfill;

// Step 3: Setup process.nextTick
(global as any).process = {
  env: {},
  // React Native doesn't have setImmediate, use setTimeout
  nextTick: function(fn: Function, ...args: any[]) {
    setTimeout(() => fn(...args), 0);
  },
};

// Step 4: Setup EventEmitter
const EventEmitter = require('events');
(global as any).EventEmitter = EventEmitter.EventEmitter || EventEmitter;

// Step 5: Setup stream polyfill
const stream = require('stream-browserify');
(global as any).stream = stream;

// Step 6: Setup crypto polyfill
const cryptoModule = require('crypto-browserify');

// Preserve Web Crypto API's getRandomValues
const webCryptoGetRandomValues = (global as any).crypto?.getRandomValues;

// Create a merged crypto object
const mergedCrypto = new Proxy(cryptoModule, {
  get(target, prop) {
    if (prop === 'getRandomValues' && webCryptoGetRandomValues) {
      return webCryptoGetRandomValues;
    }
    return target[prop];
  },
});

(global as any).crypto = mergedCrypto;

// Step 7: Setup URL polyfill
import 'react-native-url-polyfill/auto';

// Step 8: Log polyfill status
console.log('=== Polyfills Loaded Successfully ===');
console.log('Buffer:', typeof (global as any).Buffer !== 'undefined' ? '✓' : '✗');
console.log('Buffer.alloc:', typeof (global as any).Buffer?.alloc === 'function' ? '✓' : '✗');
console.log('Buffer.slice:', typeof (global as any).Buffer?.prototype?.slice === 'function' ? '✓' : '✗');
console.log('EventEmitter:', typeof (global as any).EventEmitter !== 'undefined' ? '✓' : '✗');
console.log('stream:', typeof (global as any).stream !== 'undefined' ? '✓' : '✗');
console.log('crypto:', typeof (global as any).crypto !== 'undefined' ? '✓' : '✗');
console.log('process.nextTick:', typeof (global as any).process?.nextTick === 'function' ? '✓' : '✗');
console.log('=====================================');

// Step 9: Test Buffer operations immediately
try {
  const testBuf = (global as any).Buffer.alloc(10);
  console.log('Buffer.alloc test: ✓ allocated', testBuf.length, 'bytes');

  const testBuf2 = (global as any).Buffer.alloc(20);
  const sliced = testBuf2.slice(0, 10);
  console.log('Buffer.slice test: ✓ sliced to', sliced.length, 'bytes');
} catch (error) {
  console.error('Buffer test failed:', error);
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
}

// Step 10: Global error handler
const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
if ((global as any).ErrorUtils) {
  (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error('=== GLOBAL ERROR CAUGHT ===');
    console.error('Error:', error);
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Is Fatal:', isFatal);
    console.error('============================');
    if (originalHandler) {
      originalHandler(error, isFatal);
    } else {
      throw error;
    }
  });
}
