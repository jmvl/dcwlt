import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, CameraViewProps } from 'expo-camera';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { TOKEN_ADDRESS, SOLANA_DEVNET_RPC } from '../config/constants';
import { getKeypairFromPrivateKey } from '../utils/solana';

export function QRScannerScreen({ navigation }: any) {
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { privateKey, isLoggedIn } = useWeb3Auth();

  useEffect(() => {
    setScanned(false);
  }, []);

  const handleBarCodeScanned: CameraViewProps['onBarcodeScanned'] = async ({ data }) => {
    if (scanned || isProcessing || !isLoggedIn) {
      return;
    }

    setScanned(true);
    setIsProcessing(true);

    try {
      const url = new URL(data);

      if (url.protocol !== 'solana:') {
        Alert.alert('Error', 'Invalid payment URL');
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      const merchantAddress = url.pathname;
      const amount = url.searchParams.get('amount');
      const splToken = url.searchParams.get('spl-token');

      if (!amount || !merchantAddress) {
        Alert.alert('Error', 'Invalid payment data');
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      if (TOKEN_ADDRESS === 'YOUR_TOKEN_ADDRESS_HERE') {
        Alert.alert('Configuration Error', 'Token address not configured');
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      const amountNum = parseFloat(amount);

      Alert.alert(
        'Confirm Payment',
        `Pay ${amountNum} Event Tokens to merchant?`,
        [
          { text: 'Cancel', onPress: () => { setScanned(false); setIsProcessing(false); } },
          { text: 'Pay', onPress: () => processPayment(merchantAddress, amountNum) }
        ]
      );
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to process QR code');
      setScanned(false);
      setIsProcessing(false);
    }
  };

  const processPayment = async (merchantAddress: string, amount: number) => {
    try {
      if (!privateKey) {
        throw new Error('Not logged in');
      }

      const connection = new Connection(SOLANA_DEVNET_RPC, 'confirmed');
      const fromWallet = getKeypairFromPrivateKey(privateKey);
      const toWallet = new PublicKey(merchantAddress);
      const tokenMint = new PublicKey(TOKEN_ADDRESS);

      const fromATA = await getAssociatedTokenAddress(tokenMint, fromWallet.publicKey);
      const toATA = await getAssociatedTokenAddress(tokenMint, toWallet);

      const instruction = createTransferInstruction(
        fromATA,
        toATA,
        fromWallet.publicKey,
        amount * 1e9
      );

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = fromWallet.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signature = await connection.sendTransaction(transaction, [fromWallet]);
      await connection.confirmTransaction(signature);

      Alert.alert(
        'Payment Successful',
        `Sent ${amount} EVT\n\nSignature: ${signature.slice(0, 8)}...`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', `${error.message}`);
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea} />
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          {isProcessing ? (
            <>
              <ActivityIndicator size="large" color="#14F195" />
              <Text style={styles.instructionText}>Processing...</Text>
            </>
          ) : (
            <>
              <Text style={styles.instructionText}>Align QR code in frame</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    borderColor: '#14F195',
    borderWidth: 3,
    borderRadius: 12,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
