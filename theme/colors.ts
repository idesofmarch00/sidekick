// imports
import {ColorPalette} from './themes.type';

export const lightColors: ColorPalette = {
  primary: '#18F27A', // Spring Green
  secondary: '#72FFB1', // Pale Green
  highlight: '#296AEB', // Cerulean
  error: '#F84848', // Red
  alert: '#FCF0F0', // Pale Red
  lightGray: '#F5F9FF', //light gray
  textPrimary: '#2C2E49', //black
  textSecondary: '#86A0CA', //dark gray
  blueFade: '#FFFFFF',
  redFade: '#FCF0F0',
  white: '#FFFFFF',

  //app base color
  appBaseBg: '#FFFFFF',
};

export enum ColorSelectorEnum {
  primary = '#18F27A', // Spring Green
  secondary = '#72FFB1', // Pale Green
  highlight = '#296AEB', // Cerulean
  error = '#F84848', // Red
  alert = '#FCF0F0', // Pale Red
  lightGray = '#F5F9FF', //light gray
  textPrimary = '#2C2E49', //black
  textSecondary = '#86A0CA', //dark gray
  blueFade = '#FFFFFF',
  redFade = '#FFFFFF',
  white = '#FFFFFF',
}

export type ColorSelector = keyof typeof ColorSelectorEnum;

export const darkColors: ColorPalette = {
  ...lightColors,
  // neutral: {
  //   0: '#FFFFFF', // Black
  //   100: '#A9A9A9', // Dark Gray
  //   200: '#D3D3D3', // Light Gray
  //   900: '#FFFFFF', // White
  // },
};

// export const lightColors: ColorPalette = {
//   primary: {
//     300: '#296AEB', // Cerulean
//     500: '#18F27A', // Spring Green
//   },
//   secondary: {
//     200: '#72FFB1', // Pale Green
//     400: '#FCF0F0', // Pale Red
//   },
//   neutral: {
//     0: '#FFFFFF', // White
//     100: '#F5F9FF', // Light Gray
//     200: '#86A0CA', // Dark Gray
//     900: '#2C2E49', // Black
//   },
//   semantic: {
//     error: '#F84848', // Red
//     success: '#18F27A', // Spring Green
//     warning: '#FCF0F0', // Pale Red
//   },
//   gradients: {
//     redFade: ['#FF0000', '#FFB6C1'], // Red-Fade
//     blueFade: ['#2A9D8F', '#00FF7F'], // Blue-Fade
//   },
// };

// export const darkColors: ColorPalette = {
//   ...lightColors,
//   neutral: {
//     0: '#FFFFFF', // Black
//     100: '#A9A9A9', // Dark Gray
//     200: '#D3D3D3', // Light Gray
//     900: '#FFFFFF', // White
//   },
// };

// export const colors = {
//   springGreen: '#00FF00', // Spring Green
//   paleGreen: '#B9F6CA', // Pale Green
//   cerulean: '#007BA7', // Cerulean
//   red: '#FF3B30', // Red
//   paleRed: '#F1D1D1', // Pale Red
//   black: '#000000', // Black
//   darkGray: '#A9A9A9', // Dark Gray
//   lightGray: '#D3D3D3', // Light Gray
//   white: '#FFFFFF', // White
//   redFade: '#F8B7B7', // Red-Fade
//   blueFade: '#A0B6D7', // Blue-Fade
// };
