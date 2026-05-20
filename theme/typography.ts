// dependencies
import {moderateScale} from 'react-native-size-matters';

//types
import {Theme} from './themes.type';

export const TYPOGRAPHY: Theme['typography'] = {
  // Headings
  skH1: {
    fontSize: moderateScale(34),
    lineHeight: moderateScale(34),
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontWeight: '800',
  },
  skH2: {
    fontSize: moderateScale(19),
    lineHeight: moderateScale(27),
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
  skH3: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(21),
    fontFamily: 'PlusJakartaSans-Medium',
    fontWeight: '500',
  },

  // Paragraphs
  skP1: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(23),
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
  skP2: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontFamily: 'PlusJakartaSans-Medium',
    fontWeight: '500',
  },
  skP3: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(15),
    fontFamily: 'PlusJakartaSans-Medium',
    fontWeight: '500',
  },

  // Buttons
  skButtonLarge: {
    fontSize: moderateScale(20),
    lineHeight: moderateScale(30),
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
  skButtonMedium: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(24),
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
  skButtonSmall: {
    fontSize: moderateScale(11.5),
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
  skButtonTiny: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(15),
    fontFamily: 'PlusJakartaSans-Medium',
    fontWeight: '500',
  },

  // Body Text
  skB1: {
    fontSize: moderateScale(23),
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
  skB2: {
    fontSize: moderateScale(13.5),
    lineHeight: moderateScale(17),
    fontFamily: 'PlusJakartaSans-Medium',
    fontWeight: '600',
  },

  //   labels
  skLabel: {
    fontSize: moderateScale(13.5),
    lineHeight: moderateScale(17),
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
};
