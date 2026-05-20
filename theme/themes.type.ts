// dependencies
import {ViewStyle, TextStyle} from 'react-native';

export type ColorPalette = {
  primary: string; // Spring Green
  secondary: string; // Pale Green
  highlight: string; //Cerulean
  error: string; //red
  alert: string; // pale red
  textPrimary: string; //black
  textSecondary: string; //dark gray
  lightGray: string; //light gray
  redFade: string; // Red Gradient or Accent color
  blueFade: string; // Blue Gradient or Accent color
  white: string;
  appBaseBg: string;
};

type CustomTextStyle = {
  fontSize: number | undefined;
  lineHeight?: number | undefined;
  fontFamily: string;
  fontWeight: TextStyle['fontWeight'];
};

export type Theme = {
  colors: ColorPalette;
  typography: {
    skH1: CustomTextStyle;
    skH2: CustomTextStyle;
    skH3: CustomTextStyle;
    skP1: CustomTextStyle;
    skP2: CustomTextStyle;
    skP3: CustomTextStyle;
    skButtonLarge: CustomTextStyle;
    skButtonMedium: CustomTextStyle;
    skButtonSmall: CustomTextStyle;
    skButtonTiny: CustomTextStyle;
    skB1: CustomTextStyle;
    skB2: CustomTextStyle;
    skLabel: CustomTextStyle;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: ViewStyle;
    md: ViewStyle;
  };
};
