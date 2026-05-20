import {moderateScale, moderateVerticalScale} from 'react-native-size-matters';
import {horizontalScale} from './metrics';

const THEME = {
  fonts: {
    fontFamily: {
      regular: 'Inter_400Regular',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },

    heading_28: {
      fontSize: horizontalScale(28),
      fontFamily: 'Inter_700Bold',
    },
    heading_24: {
      fontSize: horizontalScale(24),
      fontFamily: 'Inter_700Bold',
    },
    heading_20: {
      fontSize: horizontalScale(20),
      fontFamily: 'Inter_700Bold',
    },
    heading_18: {
      fontSize: horizontalScale(18),
      fontFamily: 'Inter_700Bold',
    },
    heading_16: {
      fontSize: horizontalScale(16),
      fontFamily: 'Inter_700Bold',
    },
    heading_14: {
      fontSize: moderateScale(14),
      fontFamily: 'Inter_700Bold',
    },
    heading_12: {
      fontSize: horizontalScale(12),
      fontFamily: 'Inter_700Bold',
    },
    subheading_20: {
      fontSize: horizontalScale(20),
      fontFamily: 'Inter_600SemiBold',
    },

    body_16: {
      fontSize: horizontalScale(16),
      fontFamily: 'Inter_400Regular',
    },
    body_14: {
      fontSize: horizontalScale(14),
      fontFamily: 'Inter_400Regular',
    },
    body_12: {
      fontSize: horizontalScale(12),
      fontFamily: 'Inter_400Regular',
    },
    body_10: {
      fontSize: horizontalScale(10),
      fontFamily: 'Inter_400Regular',
    },

    label_14: {
      fontSize: horizontalScale(14),
      fontFamily: 'Inter_600SemiBold',
    },
    caption_12: {
      fontSize: horizontalScale(12),
      fontFamily: 'Inter_400Regular',
    },
  },

  spacing: {
    xs_4: moderateScale(4),
    sm_8: moderateScale(8),
    md_16: moderateScale(16),
    lg_24: moderateScale(24),
    xl_32: moderateScale(32),
  },

  padding: {
    horizontal: {
      xs_4: moderateScale(4),
      sm_8: moderateScale(8),

      md_16: moderateScale(16),
      md_20: moderateScale(20),
      lg_24: moderateScale(24),
      xl_32: moderateScale(32),
      sm_12: moderateScale(12),
    },
    vertical: {
      xs_4: moderateVerticalScale(4),
      sm_8: moderateVerticalScale(8),
      md_16: moderateVerticalScale(16),
      lg_24: moderateVerticalScale(24),
      lg_30: moderateVerticalScale(30),
      xl_32: moderateVerticalScale(32),
    },
  },

  margin: {
    horizontal: {
      xs_4: moderateScale(4),
      sm_8: moderateScale(8),
      sm_12: moderateScale(12),
      md_16: moderateScale(16),
      md_20: moderateScale(20),
      lg_24: moderateScale(24),
      xl_32: moderateScale(32),
      xxl_44: moderateScale(44),
    },
    vertical: {
      xs_4: moderateVerticalScale(4),
      sm_8: moderateVerticalScale(8),
      sm_12: moderateVerticalScale(12),
      md_16: moderateVerticalScale(16),
      lg_24: moderateVerticalScale(24),
      xl_32: moderateVerticalScale(32),
    },
  },

  borderRadius: {
    sm_4: moderateScale(4),
    md_8: moderateScale(8),
    lg_16: moderateScale(16),
    xl_24: moderateScale(24),
  },
};

export default THEME;
