// CRITICAL: Buffer polyfill preamble for Metro bundler
// This file is injected at the bundle level by metro.config.js
// It runs BEFORE any other modules to ensure Buffer is available during module evaluation

// Step 1: Set up globals that Buffer depends on
if (typeof global === 'undefined') {
  global = {};
}

if (typeof global.process === 'undefined') {
  global.process = { env: {} };
}

// Step 2: Import and setup Buffer from npm 'buffer' package
// This MUST use require() not import to work at bundle level
const Buffer = require('buffer').Buffer;

// Step 3: Set Buffer globally IMMEDIATELY
global.Buffer = Buffer;

// Step 4: Verify Buffer is working
if (typeof global.Buffer.from !== 'function') {
  console.error('Buffer polyfill failed: Buffer.from is not a function');
}

if (typeof global.Buffer.alloc !== 'function') {
  console.error('Buffer polyfill failed: Buffer.alloc is not a function');
}

// Step 5: Set up other required globals for crypto-browserify
if (typeof global.EventEmitter === 'undefined') {
  const EventEmitter = require('events');
  global.EventEmitter = EventEmitter.EventEmitter || EventEmitter;
}

if (typeof global.stream === 'undefined') {
  global.stream = require('stream-browserify');
}

// Step 6: Set up crypto polyfill
const cryptoModule = require('crypto-browserify');
global.crypto = cryptoModule;

console.log('Buffer polyfill preamble loaded successfully');
