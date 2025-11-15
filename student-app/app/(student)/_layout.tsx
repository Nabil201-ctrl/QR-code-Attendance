import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="scan" 
        options={{ 
          presentation: 'modal',
          title: 'Scan QR Code',
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}