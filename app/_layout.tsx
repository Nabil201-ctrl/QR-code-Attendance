import { Tabs } from 'expo-router';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queryClient';
import { TabBarIcon } from './components/TabBarIcon';
import { Colors } from './constants/Colors';
import { useColorScheme } from './hooks/useColorScheme';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="(student)"
          options={{
            title: 'Student',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(admin)"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
