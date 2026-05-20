// src/hooks/useTheme.ts
import {useThemeStore} from '@/globalStore';

export const useTheme = () => {
  const {
    isDark,
    theme,
    actions: {setTheme, toggleTheme},
  } = useThemeStore();

  return {
    theme,
    isDark,
    toggleTheme,
    setDarkTheme: () => setTheme(true),
    setLightTheme: () => setTheme(false),
  };
};

// For components that only need theme values
export const useThemeColors = () => useThemeStore(state => state.theme.colors);
