import React, { createContext, useContext, useState, useEffect } from 'react';
// CRITICAL: Do NOT import Web3Auth or SolanaPrivateKeyProvider at the top level!
// This causes Buffer to be accessed before polyfills are ready.
// Instead, we will lazy-load them when needed.
// import Web3Auth, { WEB3AUTH_NETWORK, ChainNamespace } from '@web3auth/react-native-sdk';
// import { SolanaPrivateKeyProvider } from '../utils/SolanaPrivateKeyProvider';

import { openAuthSessionAsync, dismissAuthSession } from '@toruslabs/react-native-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deriveSolanaAddress } from '../utils/solana';

console.log('Web3AuthContext: Module loaded');

// WebBrowser interface for Web3Auth - pass the module directly with required methods
const WebBrowser = {
  openAuthSessionAsync,
  dismissAuthSession,
};

// Create an EncryptedStorage adapter using AsyncStorage
const storageAdapter = {
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
  clear: async () => {
    await AsyncStorage.clear();
  },
};

interface Web3AuthContextType {
  web3auth: any | null;
  privateKey: string | null;
  walletAddress: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | null>(null);

// Get redirect URL from app config
const getRedirectUrl = () => {
  const scheme = 'eventwallet';
  return `${scheme}://auth`;
};

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const [web3auth, setWeb3auth] = useState<any>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Web3AuthProvider: init called');
    init();
  }, []);

  const init = async () => {
    try {
      // TEST MODE: Skip Web3Auth initialization for UI testing
      const TEST_MODE = true;
      if (TEST_MODE) {
        console.log('TEST MODE: Skipping Web3Auth initialization');
        // Mock wallet address for testing Dashboard UI
        setWalletAddress('TestWallet1234');
        setIsLoggedIn(true);
        setIsLoading(false);
        return;
      }

      // CRITICAL: Lazy-load Web3Auth and SolanaPrivateKeyProvider after polyfills are set up
      console.log('Web3Auth: Lazy-loading @web3auth/react-native-sdk...');
      const Web3AuthModule = await import('@web3auth/react-native-sdk');
      const { Web3Auth, WEB3AUTH_NETWORK, ChainNamespace } = Web3AuthModule;
      console.log('Web3Auth: Module loaded successfully');

      // Lazy-load SolanaPrivateKeyProvider
      const { SolanaPrivateKeyProvider } = await import('../utils/SolanaPrivateKeyProvider');
      console.log('SolanaPrivateKeyProvider: Loaded successfully');

      // Web3Auth client ID from app.json
      const clientId = 'BF_3EwSny_eyZmyDHMK-FOv1mu3Zrt7gRB5G9TQQtoBYmo_2Hww_Yd6l0xCqKBLadXIM0ZVEKNCwfAxaqvHc648';

      if (!clientId) {
        console.warn('Web3Auth Client ID not configured properly');
        setIsLoading(false);
        return;
      }

      console.log('Web3Auth: Initializing with WEB3AUTH_NETWORK.TESTNET...');

      // Create Solana Private Key Provider
      const privateKeyProvider = new SolanaPrivateKeyProvider({
        chainNamespace: ChainNamespace.SOLANA,
        chainId: '0x3', // Solana Devnet
        rpcTarget: 'https://api.devnet.solana.com',
        displayName: 'Solana Devnet',
        blockExplorerUrl: 'https://explorer.solana.com/?cluster=devnet',
        ticker: 'SOL',
        tickerName: 'Solana',
      });

      console.log('SolanaPrivateKeyProvider created:', !!privateKeyProvider);

      // Initialize Web3Auth with WebBrowser, storage, and options
      const web3AuthInstance = new Web3Auth(WebBrowser, storageAdapter, {
        clientId,
        network: WEB3AUTH_NETWORK.TESTNET,
        redirectUrl: getRedirectUrl(),
        privateKeyProvider,
      });

      console.log('Web3Auth instance created, calling init()...');

      // Initialize the SDK
      await web3AuthInstance.init();

      console.log('Web3Auth init() completed');

      setWeb3auth(web3AuthInstance);

      // Check if user is already logged in via provider
      const provider = web3AuthInstance.provider;
      if (provider) {
        console.log('Provider found, checking for existing session...');
        try {
          const privKey = await provider.request<string, string>({ method: 'solanaPrivateKey' });
          if (privKey) {
            setPrivateKey(privKey);
            const address = await deriveSolanaAddress(privKey);
            setWalletAddress(address);
            setIsLoggedIn(true);
            console.log('Existing session restored for:', address);
          }
        } catch (sessionError) {
          console.log('No existing session found (expected for first launch)');
        }
      } else {
        console.log('No provider found (user not logged in yet)');
      }

      console.log('Web3Auth initialized successfully');
    } catch (error) {
      console.error('Web3Auth init error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    try {
      console.log('Web3Auth login: Starting...');

      // Login with Google (default provider)
      const provider = await web3auth.login({
        loginProvider: 'google',
        redirectUrl: getRedirectUrl(),
      });

      console.log('Web3Auth login: Provider received:', !!provider);

      if (provider) {
        // Get private key from provider
        const privKey = await provider.request<string, string>({ method: 'solanaPrivateKey' });
        console.log('Web3Auth login: Private key received:', !!privKey);

        if (privKey) {
          setPrivateKey(privKey);
          // Derive Solana address from private key
          const address = await deriveSolanaAddress(privKey);
          console.log('Web3Auth login: Wallet address derived:', address);
          setWalletAddress(address);
          setIsLoggedIn(true);
          console.log('Web3Auth login: State updated - isLoggedIn = true');
        }

        console.log('Web3Auth login successful');
      } else {
        console.error('Web3Auth login: No provider returned');
        throw new Error('Login failed - no provider returned');
      }
    } catch (error) {
      console.error('Web3Auth login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!web3auth) return;

    try {
      await web3auth.logout();
      setPrivateKey(null);
      setWalletAddress(null);
      setIsLoggedIn(false);
      console.log('Web3Auth logout successful');
    } catch (error) {
      console.error('Web3Auth logout error:', error);
    }
  };

  return (
    <Web3AuthContext.Provider
      value={{
        web3auth,
        privateKey,
        walletAddress,
        isLoggedIn,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
}

export function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within Web3AuthProvider');
  }
  return context;
}
