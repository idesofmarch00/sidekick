// dependencies
import React from 'react';
import {View, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import {SvgProps} from 'react-native-svg';

// store
import {useThemeStore} from '@/globalStore';

//components
import Switch from '@/components/Switch';
import {H3} from '@/components';
import {ScrollView} from 'react-native-gesture-handler';

interface MenuItem {
  /**
   * Icon name from the icon library
   */
  icon: React.FC<SvgProps>;
  /**
   * Label text for the menu item
   */
  label: string;
  /**
   * Type of control for the menu item
   */
  controlType?: 'none' | 'switch';
  /**
   * Whether the switch is toggled on (only for switch control type)
   */
  isToggled?: boolean;
  /**
   * Function to call when menu item is pressed
   */
  onPress: () => void;
  /**
   * Function to call when switch is toggled (only for switch control type)
   */
  onToggle?: (value: boolean) => void;
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

interface MenuProps {
  /**
   * Array of menu items to display
   */
  items: MenuItem[];
  /**
   * Custom styles to override default container styles
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Menu component displays a list of actionable items with icons and optional controls
 */
const Menu: React.FC<MenuProps> = ({items, style, testID}) => {
  const {colors, spacing} = useThemeStore(state => state.theme);

  return (
    <ScrollView
      style={[
        {flex: 1},
        {
          backgroundColor: colors.white,
          height: '100%',
        },
        style,
      ]}
      testID={testID}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.menuItem,
            {paddingVertical: spacing.md, paddingHorizontal: spacing.md},
            index < items.length - 1 && styles.borderBottom,
            index < items.length - 1 && {borderBottomColor: colors.lightGray},
          ]}
          onPress={item.onPress}
          testID={item.testID || `menu-item-${index}`}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          disabled={item.controlType === 'switch'} // Disable press on the entire row for switch items
        >
          <View style={styles.leftContent}>
            <item.icon style={styles.icon} />
            <H3
              textColor={
                item.testID === 'delete-account' ? 'error' : 'textPrimary'
              }>
              {item.label}
            </H3>
          </View>

          {item.controlType === 'switch' && (
            <Switch
              isOn={item.isToggled}
              onToggle={item.onToggle}
              size="small"
              testID={`${item.testID || `menu-item-${index}`}-switch`}
              accessibilityLabel={`Toggle ${item.label}`}
            />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = ScaledSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
});

export default Menu;
