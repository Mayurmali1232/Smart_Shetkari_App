import React from 'react';
import '../utils/alertPolyfill';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import '../i18n';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#f8fafc' }
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="employees/index" />
            <Stack.Screen name="employees/add" />
            <Stack.Screen name="employees/[id]" />
            <Stack.Screen name="attendance/index" />
            <Stack.Screen name="wages/index" />
            <Stack.Screen name="tractors/index" />
            <Stack.Screen name="tractors/add" />
            <Stack.Screen name="tractors/[id]" />
            <Stack.Screen name="bookings/index" />
            <Stack.Screen name="bookings/add" />
            <Stack.Screen name="expenses/index" />
            <Stack.Screen name="reports/index" />
            <Stack.Screen name="dairy/index" />
            <Stack.Screen name="dairy/animals/index" />
            <Stack.Screen name="dairy/animals/add" />
            <Stack.Screen name="dairy/animals/[id]" />
            <Stack.Screen name="dairy/milk-production/index" />
            <Stack.Screen name="dairy/milk-sales/index" />
            <Stack.Screen name="dairy/expenses/index" />
            <Stack.Screen name="dairy/health/index" />
            <Stack.Screen name="dairy/profit-loss/index" />
            <Stack.Screen name="dairy/reports/index" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="notifications" />
          </Stack>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
