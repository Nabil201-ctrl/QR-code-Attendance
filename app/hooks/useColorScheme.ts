import { useColorScheme as useNativewindColorScheme } from 'nativewind';

export function useColorScheme() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useNativewindColorScheme();
  return {
    colorScheme: colorScheme ?? 'light',
    isDark: colorScheme === 'dark',
    toggleColorScheme,
    setColorScheme,
  }
}
