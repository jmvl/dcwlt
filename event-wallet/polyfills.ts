// Polyfills for React Native crypto operations
// IMPORTANT: Must be imported first in App.tsx before any other imports

import 'react-native-get-random-values';
import { Buffer } from 'react-native-buffer';

// Global polyfills
(global as any).Buffer = Buffer;

// URL polyfill for React Native
import 'react-native-url-polyfill/auto';

// Subtle crypto polyfill
if (!(global as any).crypto) {
  (global as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  };
}
