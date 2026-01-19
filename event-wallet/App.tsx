// CRITICAL: Buffer polyfill must be set up BEFORE ANY OTHER IMPORTS
// Use require() instead of import to ensure it runs immediately
require('./src/buffer-polyfill');

// CRITICAL: Gesture handler must be imported first for React Navigation
import 'react-native-gesture-handler';

// CRITICAL: Other polyfills must be imported next for crypto operations
import './polyfills';

import { StatusBar } from 'expo-status-bar';
import { Web3AuthProvider } from './src/contexts/Web3AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Web3AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </Web3AuthProvider>
    </ErrorBoundary>
  );
}
