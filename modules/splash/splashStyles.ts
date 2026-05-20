// dependencies
import {ScaledSheet} from 'react-native-size-matters';

// store
import {useThemeStore} from '@/globalStore';

const {theme} = useThemeStore.getState();

export const splashStyles = ScaledSheet.create({
  layoutBackground: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomButtonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: '32@vs',
    left: 0,
    alignItems: 'center',
  },
});
