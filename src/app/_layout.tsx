/**
 * RootLayout Component
 *
 * App-wide navigation shell:
 * - ThemeProvider: light/dark system color scheme synchronization
 * - Stack Navigator: headerless screen transitions
 * - StatusBar: dark icons on clean white surface
 */

import { ToastProvider } from '@/context/ToastContext';
import { ChatProvider } from '@/context/ChatContext';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <ChatProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ChatProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

