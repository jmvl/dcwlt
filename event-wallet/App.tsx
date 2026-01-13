// CRITICAL: Polyfills must be imported first for crypto operations
import './polyfills';

import { StatusBar } from 'expo-status-bar';
import { Web3AuthProvider } from './src/contexts/Web3AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Web3AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </Web3AuthProvider>
  );
}
