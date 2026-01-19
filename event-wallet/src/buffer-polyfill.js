// CRITICAL: This file is injected by Metro before any other modules
// This ensures Buffer is available before Web3Auth modules try to use it

// CRITICAL: Define window, self, globalThis, and setImmediate before ANYTHING else
// Some polyfills (like readable-stream) try to check typeof window
// which throws an error in Hermes if window is not defined at all
if (typeof global === 'undefined') {
  global = {};
}
if (typeof window === 'undefined') {
  global.window = global;
}
if (typeof self === 'undefined') {
  global.self = global;
}
if (typeof globalThis === 'undefined') {
  global.globalThis = global;
}

// Polyfill setImmediate for React Native (use setTimeout)
if (typeof setImmediate === 'undefined') {
  global.setImmediate = function(fn) {
    return setTimeout(fn, 0);
  };
  global.clearImmediate = function(timer) {
    return clearTimeout(timer);
  };
}

// Import Buffer from react-native-buffer (which is designed for React Native)
const { Buffer: ReactNativeBuffer } = require('react-native-buffer');

// Also import from 'buffer' package for compatibility
const { Buffer: NpmBuffer } = require('buffer');

// Use the npm buffer package as it's more compatible with crypto dependencies
global.Buffer = NpmBuffer;

// Also set on window/self/global for compatibility
global.window.Buffer = NpmBuffer;
global.self.Buffer = NpmBuffer;
global.globalThis.Buffer = NpmBuffer;

// Make sure require('buffer') returns the right Buffer
const bufferModule = require('buffer');
bufferModule.Buffer = NpmBuffer;

// Log that Buffer is set
console.log('[buffer-polyfill] Buffer has been set globally');
console.log('[buffer-polyfill] Buffer.from:', typeof NpmBuffer.from === 'function' ? '✓' : '✗');
console.log('[buffer-polyfill] Buffer.alloc:', typeof NpmBuffer.alloc === 'function' ? '✓' : '✗');
console.log('[buffer-polyfill] Buffer.prototype.slice:', typeof NpmBuffer.prototype.slice === 'function' ? '✓' : '✗');

// Test Buffer operations immediately
try {
  const testBuf = NpmBuffer.alloc(10);
  console.log('[buffer-polyfill] Buffer.alloc test: ✓ allocated', testBuf.length, 'bytes');

  const testBuf2 = NpmBuffer.alloc(20);
  const sliced = testBuf2.slice(0, 10);
  console.log('[buffer-polyfill] Buffer.slice test: ✓ sliced to', sliced.length, 'bytes');
} catch (error) {
  console.error('[buffer-polyfill] Buffer test failed:', error);
  console.error('[buffer-polyfill] Error stack:', error.stack);
}
