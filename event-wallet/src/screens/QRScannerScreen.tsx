import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

export function QRScannerScreen({ navigation }: any) {
  const [scanned, setScanned] = useState(false);
  const device = useCameraDevice('back');

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Camera not available</Text>
      </View>
    );
  }

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    // Performance optimizations for better QR recognition
    interval: 'fast', // Aggressive scanning for faster detection
    isPerformanceModeEnabled: true, // Prioritize speed over quality
    onCodeScanned: (codes) => {
      if (scanned) return;

      const value = codes[0]?.value;
      if (value) {
        setScanned(true);
        handleSolanaPayURL(value);
      }
    },
  });

  const handleSolanaPayURL = (url: string) => {
    try {
      // Parse Solana Pay URL: solana:<address>?amount=<amount>&spl-token=<token>
      const parsed = new URL(url);
      const recipient = parsed.pathname;
      const amount = parsed.searchParams.get('amount');
      const token = parsed.searchParams.get('spl-token');

      Alert.alert(
        'Confirm Payment',
        `Send ${amount} tokens to ${recipient.slice(0, 8)}...?`,
        [
          { text: 'Cancel', onPress: () => setScanned(false) },
          {
            text: 'Pay',
            onPress: () => {
              // TODO: Implement payment logic
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Invalid QR Code', 'Could not parse payment URL');
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        // Performance optimizations
        photo={false}
        video={false}
        enableZoomGesture={false}
        // Lower resolution prioritizes performance for QR scanning
        // MLKit works best with 2MP or lower for real-time scanning
      />
      <View style={styles.overlay}>
        <Text style={styles.instructions}>Align QR code within frame</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
