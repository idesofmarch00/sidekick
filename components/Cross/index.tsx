// src/components/Icons/CrossIcon.tsx
import React from 'react';
import {TouchableOpacity, ViewStyle, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useThemeStore} from '@/theme/store';

interface CrossIconProps {
  /**
   * Size of the icon in pixels
   */
  size?: number | 'small' | 'medium' | 'large';
  /**
   * Color of the icon, defaults to theme's neutral[900]
   */
  color?: string;
  /**
   * Callback function when icon is pressed
   */
  onClick?: () => void;
  /**
   * Optional styles for container
   */
  style?: ViewStyle;
  /**
   * Whether the icon is disabled
   */
  disabled?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
}

/**
 * CrossIcon component displays a clickable "x" icon using Feather icons
 */
const CrossIcon: React.FC<CrossIconProps> = ({
  size = 'medium',
  color,
  onClick,
  style,
  disabled = false,
  testID = 'cross-icon',
  accessibilityLabel = 'Close',
}) => {
  // Access theme values
  const {colors} = useThemeStore(state => state.theme);

  // Default color from theme
  const iconColor = color || colors.textSecondary;

  // Size mapping for named sizes
  const sizeMap = {
    small: 12,
    medium: 16, // Default size as mentioned in requirements
    large: 24,
  };

  // Resolve the size value
  const iconSize = typeof size === 'number' ? size : sizeMap[size];

  // Calculate appropriate touch target size (ensuring minimum 44x44 for accessibility)
  const touchTargetSize = Math.max(44, iconSize * 1.5);

  // Determine padding to center the icon in the touch target
  const containerPadding = (touchTargetSize - iconSize) / 2;

  return (
    <TouchableOpacity
      onPress={onClick}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessible={true}
      style={[
        styles.container,
        {
          opacity: disabled ? 0.5 : 1,
          padding: containerPadding,
          width: touchTargetSize,
          height: touchTargetSize,
        },
        style,
      ]}
      activeOpacity={0.7}>
      <Icon name="x" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CrossIcon;
