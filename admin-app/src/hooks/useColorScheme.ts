import { useEffect, useState } from 'react';

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = localStorage.getItem('user-theme') as 'light' | 'dark';
      if (storedTheme) {
        setColorScheme(storedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setColorScheme('dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleColorScheme = async () => {
    const newTheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newTheme);
    try {
      localStorage.setItem('user-theme', newTheme);
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