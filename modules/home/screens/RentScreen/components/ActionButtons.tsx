// dependencies
import {Pressable, View, ViewStyle} from 'react-native';
import React from 'react';
import {ScaledSheet} from 'react-native-size-matters';

// stores
import {useThemeStore} from '@/globalStore';

// components
import NearestHubIcon from '../../../assets/nearestHubIcon.svg';
import ScanIcon from '../../../assets/scanIcon.svg';
import {ButtonSmall, ButtonWithIcon, Divider} from '@/components';

type Props = {
  containerStyles: ViewStyle;
  handleOpenModal: () => void;
  onSelectNearestHub: () => void;
};

const {
  theme: {colors},
} = useThemeStore.getState();

const ActionButtons: React.FC<Props> = ({
  containerStyles,
  handleOpenModal,
  onSelectNearestHub,
}) => {
  return (
    <View style={[containerStyles]}>
      <Pressable onPress={onSelectNearestHub} style={styles.nearestHubContainer}>
        <NearestHubIcon />
        <ButtonSmall textColor="highlight">Nearest Hub</ButtonSmall>
      </Pressable>
      <Divider height={3.2} />
      <ButtonWithIcon
        variant="primary"
        onPress={handleOpenModal}
        IconComponent={ScanIcon}>
        Unlock
      </ButtonWithIcon>
    </View>
  );
};

export default ActionButtons;

const styles = ScaledSheet.create({
  nearestHubContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: '19@ms',
    paddingVertical: '8@ms',
    borderRadius: 23,
    columnGap: 10,
  },
});
