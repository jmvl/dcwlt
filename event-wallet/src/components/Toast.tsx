import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  visible: boolean;
  onHidden: () => void;
}

/**
 * Toast notification component for user feedback
 * Provides non-intrusive feedback for actions like success, errors, warnings
 */
export function Toast({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onHidden,
}: ToastProps) {
  const { height: screenHeight } = Dimensions.get('window');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHidden();
    });
  };

  if (!visible) {
    return null;
  }

  const getToastStyle = (): { backgroundColor: string; icon: string } => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10B981', icon: '✓' };
      case 'error':
        return { backgroundColor: '#EF4444', icon: '✕' };
      case 'warning':
        return { backgroundColor: '#F59E0B', icon: '⚠' };
      case 'info':
      default:
        return { backgroundColor: '#3B82F6', icon: 'ℹ' };
    }
  };

  const { backgroundColor, icon } = getToastStyle();

  return (
    <View style={[styles.overlay, { top: 50 }]}>
      <Animated.View
        style={[
          styles.toastContainer,
          { backgroundColor, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
    color: '#fff',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
