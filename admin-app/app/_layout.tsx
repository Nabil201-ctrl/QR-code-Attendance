import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../utils/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(student)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}