import { useColorScheme as _useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const systemColorScheme = _useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('user-theme');
      if (storedTheme) {
        setColorScheme(storedTheme as 'light' | 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleColorScheme = async () => {
    const newTheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('user-theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return {
    colorScheme,
    toggleColorScheme,
    isDark: colorScheme === 'dark',
  };
}