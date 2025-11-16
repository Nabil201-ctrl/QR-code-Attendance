import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../utils/queryClient';

export default function AdminLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="generate-qr"
          options={{
            title: 'Generate QR Code',
          }}
        />
        <Stack.Screen
          name="students"
          options={{
            title: 'Students',
          }}
        />
        <Stack.Screen
          name="add-student"
          options={{
            title: 'Add Student',
          }}
        />
        <Stack.Screen
          name="edit-student"
          options={{
            title: 'Edit Student',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}