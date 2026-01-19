import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  QRScanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isLoggedIn, isLoading } = useWeb3Auth();

  console.log('AppNavigator: Render - isLoggedIn:', isLoggedIn, 'isLoading:', isLoading);

  if (isLoading) {
    console.log('AppNavigator: Showing loading spinner');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#9945FF" />
      </View>
    );
  }

  console.log('AppNavigator: Navigation state - isLoggedIn:', isLoggedIn ? 'DASHBOARD' : 'LOGIN');

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
