import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useWeb3Auth } from '../contexts/Web3AuthContext';

export function LoginScreen() {
  const { login, isLoading } = useWeb3Auth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      console.log('LoginScreen: Initiating login...');
      await login();
      console.log('LoginScreen: Login completed successfully');
    } catch (error) {
      console.error('LoginScreen: Login failed:', error);
      // In production, show user-friendly error message
      Alert.alert(
        'Login Failed',
        'Unable to complete login. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading || isLoggingIn) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={styles.loadingText}>
          {isLoggingIn ? 'Signing in with Google...' : 'Initializing...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🎪</Text>
        <Text style={styles.title}>Event Wallet</Text>
        <Text style={styles.subtitle}>Pay with crypto at events</Text>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Solana & Web3Auth</Text>
        <Text style={styles.devnetBadge}>Devnet Only - No Real Money</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9945FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 280,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  devnetBadge: {
    fontSize: 10,
    color: '#14F195',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
