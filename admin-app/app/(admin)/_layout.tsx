import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
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
        name="add-student" // Add this line
        options={{
          title: 'Add Student',
        }}
      />
      <Stack.Screen
        name="edit-student" // Add this line
        options={{
          title: 'Edit Student',
        }}
      />
    </Stack>
  );
}