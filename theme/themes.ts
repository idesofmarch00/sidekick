import {darkColors, lightColors} from './colors';
import {TYPOGRAPHY} from './typography';
import {Theme} from './themes.type';

export const lightTheme: Theme = {
  colors: lightColors,
  typography: {...TYPOGRAPHY},
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadows: {
    sm: {
      shadowColor: lightColors.textPrimary,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: lightColors.textPrimary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};

// Dark theme variations
export const darkTheme: Theme = {
  ...lightTheme,
  colors: darkColors,
  typography: {
    ...lightTheme.typography,
  },
};
