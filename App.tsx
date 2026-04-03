import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Root entry point — mirrors MainActivity.kt.
 *
 * MainActivity wraps everything in ExpenseTrackerTheme { MainScreen(...) }.
 * Here we wrap in NavigationContainer + AppNavigator.
 */
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}
