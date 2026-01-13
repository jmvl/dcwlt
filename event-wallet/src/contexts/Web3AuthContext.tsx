import React, { createContext, useContext, useState, useEffect } from 'react';
import { Web3Auth, Web3AuthOptions } from '@web3auth/react-native-sdk';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import * as Constants from 'expo-constants';
import { Connection } from '@solana/web3.js';
import { deriveSolanaAddress } from '../utils/solana';
import { SOLANA_DEVNET_RPC } from '../config/constants';

interface Web3AuthContextType {
  web3auth: Web3Auth | null;
  privateKey: string | null;
  walletAddress: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | null>(null);

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const clientId = Constants.expoConfig?.extra?.web3authClientId as string;

      if (!clientId || clientId === 'YOUR_WEB3AUTH_CLIENT_ID_HERE') {
        console.warn('Web3Auth Client ID not configured. Please update app.json');
        setIsLoading(false);
        return;
      }

      const options: Web3AuthOptions = {
        clientId,
        network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.SOLANA,
          chainId: '0x3', // Devnet
          rpcTarget: SOLANA_DEVNET_RPC,
          displayName: 'Solana Devnet',
          blockExplorer: 'https://explorer.solana.com/?cluster=devnet',
          ticker: 'SOL',
          tickerName: 'Solana',
        },
      };

      const web3AuthInstance = new Web3Auth(options);
      await web3AuthInstance.init();
      setWeb3auth(web3AuthInstance);

      if (web3AuthInstance.connected) {
        await getUserInfo(web3AuthInstance);
      }
    } catch (error) {
      console.error('Web3Auth init error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async (web3AuthInstance: Web3Auth) => {
    try {
      const key = await web3AuthInstance.privKey;
      setPrivateKey(key);

      // Derive Solana address from private key
      if (key) {
        const address = await deriveSolanaAddress(key);
        setWalletAddress(address);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const login = async () => {
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    try {
      await web3auth.login();
      await getUserInfo(web3auth);
    } catch (error) {
      console.error('Login error:', error);
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
    } catch (error) {
      console.error('Logout error:', error);
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
