// src/components/Avatar/Avatar.tsx
import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Assuming you're using Feather icons
import {useThemeStore} from '@/theme/store';

interface AvatarProps {
  /**
   * The full name to extract initials from
   */
  fullName?: string;
  /**
   * Optional children to render instead of initials
   */
  children?: React.ReactNode;
  /**
   * Optional image source for avatar
   */
  imageSource?: ImageSourcePropType;
  /**
   * Whether to show a profile icon instead of initials
   */
  showProfileIcon?: boolean;
  /**
   * Visual variant of the avatar
   */
  variant?: 'rounded' | 'outlined' | 'squared';
  /**
   * Size variant of the avatar
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Optional callback when avatar is pressed
   */
  onPress?: () => void;
  /**
   * Custom styles to override default container styles
   */
  style?: ViewStyle;
  /**
   * Custom styles to override default text styles
   */
  textStyle?: TextStyle;
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
 * Avatar component displays user initials, image, profile icon or custom content in a styled container
 */
const Avatar: React.FC<AvatarProps> = ({
  fullName = '',
  children,
  imageSource,
  showProfileIcon = false,
  variant = 'rounded',
  size = 'medium',
  onPress,
  style,
  textStyle,
  testID = 'avatar',
  accessibilityLabel,
}) => {
  // Access theme values from the store
  const {colors, spacing, typography} = useThemeStore(state => state.theme);

  // Calculate initials from fullName
  const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return '';
    }

    const parts = name
      .trim()
      .split(' ')
      .filter(part => part.length > 0);

    // Handle different name formats
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Define variant styles as a mapping
  const variantStyles: Record<string, ViewStyle> = {
    rounded: {
      borderRadius: 999, // Fully rounded
      backgroundColor: colors.highlight || '#007AFF', // Fallback color
      borderWidth: 0,
    },
    outlined: {
      borderRadius: 999,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.highlight,
    },
    squared: {
      borderRadius: 8, // Using a fixed value since borderRadius.md is commented out
      backgroundColor: colors.highlight,
      borderWidth: 0,
    },
  };

  // Define size styles as a mapping
  const sizeStyles: Record<
    string,
    ViewStyle & {fontSize: number; iconSize: number}
  > = {
    small: {
      width: spacing.xl,
      height: spacing.xl,
      fontSize: typography.skP1.fontSize as number,
      iconSize: 16,
    },
    medium: {
      width: spacing.xl,
      height: spacing.xl,
      fontSize: typography.skP2.fontSize as number,
      iconSize: 24,
    },
    large: {
      width: spacing.xl,
      height: spacing.xl,
      fontSize: typography.skP3.fontSize as number,
      iconSize: 32,
    },
  };

  // Define text variant styles
  const textVariantStyles: Record<string, TextStyle> = {
    rounded: {
      color: colors.white,
    },
    outlined: {
      color: colors.highlight,
    },
    squared: {
      color: colors.white,
    },
  };

  // Determine what content to render
  const renderContent = () => {
    if (children) {
      return children;
    }

    if (imageSource) {
      return (
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      );
    }

    if (showProfileIcon) {
      return (
        <Icon
          name="user"
          size={sizeStyles[size].iconSize}
          color={variant === 'outlined' ? colors.highlight : colors.white}
        />
      );
    }

    // Default to initials
    return (
      <Text
        style={[
          styles.text,
          textVariantStyles[variant],
          {fontSize: sizeStyles[size].fontSize},
          textStyle, // Allow custom overrides
        ]}>
        {getInitials(fullName)}
      </Text>
    );
  };

  // Build the accessibility label if not provided
  const computedAccessibilityLabel =
    accessibilityLabel || (fullName ? `Avatar for ${fullName}` : 'Avatar');

  // Compose the styles
  const containerStyle = [
    styles.base,
    variantStyles[variant],
    {
      width: sizeStyles[size].width,
      height: sizeStyles[size].height,
    },
    style, // Allow custom overrides
  ];

  // Render as touchable if onPress is provided, otherwise as a View
  return onPress ? (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      testID={testID}
      accessibilityLabel={computedAccessibilityLabel}
      accessible={true}
      accessibilityRole="button">
      {renderContent()}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={containerStyle}
      testID={testID}
      accessibilityLabel={computedAccessibilityLabel}
      accessible={true}
      accessibilityRole="image">
      {renderContent()}
    </TouchableOpacity>
  );
};

// Base styles that apply to all variants
const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
