import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
