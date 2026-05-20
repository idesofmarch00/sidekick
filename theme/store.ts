// src/store/themeStore/index.ts
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {Appearance} from 'react-native';

// selectoes
import createSelectors from '@/utils/selectors';
import {lightTheme, darkTheme} from './themes';
import {zustandMmkvStorage} from '@/storage/mmkv';
import {Theme} from './themes.type';

type ThemeState = {
  theme: Theme;
  isDark: boolean;
  systemTheme: 'light' | 'dark';
  actions: {
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
    resetToSystem: () => void;
  };
};

export const themeStoreBase = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: lightTheme,
      isDark: false,
      systemTheme: Appearance.getColorScheme() || 'light',
      actions: {
        toggleTheme: () => {
          const newDark = !get().isDark;
          set({
            isDark: newDark,
            theme: newDark ? darkTheme : lightTheme,
          });
        },
        setTheme: dark => {
          set({
            isDark: dark,
            theme: dark ? darkTheme : lightTheme,
          });
        },
        resetToSystem: () => {
          const systemDark = get().systemTheme === 'dark';
          set({
            isDark: systemDark,
            theme: systemDark ? darkTheme : lightTheme,
          });
        },
      },
    }),
    {
      name: 'theme-storage',
      storage: zustandMmkvStorage,
      partialize: state => ({isDark: state.isDark}),
    },
  ),
);

// System theme listener
Appearance.addChangeListener(({colorScheme}) => {
  themeStoreBase.setState({
    systemTheme: colorScheme || 'light',
  });
});

// Create typed selectors
export const useThemeStore = createSelectors(themeStoreBase);
