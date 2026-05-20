// src/components/Switch/Switch.tsx
import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  Easing,
  AccessibilityState,
} from 'react-native';
import {useThemeStore} from '@/theme/store';

interface SwitchProps {
  /**
   * Whether the switch is toggled on
   */
  isOn?: boolean;
  /**
   * Callback function when switch is toggled
   */
  onToggle?: (value: boolean) => void;
  /**
   * Size of the switch
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Optional custom styles for the container
   */
  style?: ViewStyle;
  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;
  /**
   * Optional test ID for testing
   */
  testID?: string;
  /**
   * Optional accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Switch component provides a toggle control with animated state transition
 */

const {colors, spacing} = useThemeStore.getState().theme;

const Switch: React.FC<SwitchProps> = ({
  isOn = false,
  onToggle,
  size = 'medium',
  style,
  disabled = false,
  testID = 'custom-switch',
  accessibilityLabel = 'Toggle switch',
}) => {
  // Access theme values from the store
  // const {colors, spacing} = useThemeStore(state => state.theme);

  // Internal state to track controlled/uncontrolled behavior
  const [internalIsOn, setInternalIsOn] = useState(isOn);

  // Use the right value based on controlled vs uncontrolled usage
  const isToggled = onToggle ? isOn : internalIsOn;

  // Animation value for the toggle movement
  const [animatedValue] = useState(new Animated.Value(isToggled ? 1 : 0));

  // Define size-based dimensions
  const sizeStyles = {
    small: {
      container: {
        width: spacing.xl * 1.5,
        height: spacing.lg,
        borderRadius: spacing.lg / 2,
        padding: spacing.xs,
      },
      toggle: {
        width: spacing.md,
        height: spacing.md,
        borderRadius: spacing.md / 2,
      },
    },
    medium: {
      container: {
        width: spacing.xxl * 1.5,
        height: spacing.xl,
        borderRadius: spacing.xl / 2,
        padding: spacing.xs,
      },
      toggle: {
        width: spacing.lg,
        height: spacing.lg,
        borderRadius: spacing.lg / 2,
      },
    },
    large: {
      container: {
        width: spacing.xxxl * 1.5,
        height: spacing.xxl,
        borderRadius: spacing.xxl / 2,
        padding: spacing.sm,
      },
      toggle: {
        width: spacing.xl,
        height: spacing.xl,
        borderRadius: spacing.xl / 2,
      },
    },
  };

  // Handle toggle action
  const handleToggle = () => {
    if (disabled) {
      return;
    }

    // Calculate new toggled state
    const newValue = !isToggled;

    // If controlled component, use the callback
    if (onToggle) {
      onToggle(newValue);
    } else {
      // Otherwise update internal state
      setInternalIsOn(newValue);
    }

    // Run the animation
    Animated.timing(animatedValue, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design standard curve
      useNativeDriver: false, // Required for backgroundColor animation
    }).start();
  };

  // Interpolate animation values
  const togglePosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      sizeStyles[size].container.width -
        sizeStyles[size].toggle.width -
        sizeStyles[size].container.padding * 2,
    ],
  });

  const backgroundColorInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.lightGray, colors.lightGray], // Off color to On color
  });

  // Set accessibility props
  const accessibilityState: AccessibilityState = {
    checked: isToggled,
    disabled,
  };

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.8}
      onPress={handleToggle}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={accessibilityState}
      style={style}>
      <Animated.View
        style={[
          styles.container,
          sizeStyles[size].container,
          {
            backgroundColor: backgroundColorInterpolation,
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        <Animated.View
          style={[
            {
              backgroundColor: isToggled
                ? colors.highlight
                : colors.textSecondary,
            },
            sizeStyles[size].toggle,
            {
              transform: [{translateX: togglePosition}],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    borderColor: '#333333',
  },
});

export default Switch;
