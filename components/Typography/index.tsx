import React from 'react';
import {Text, StyleSheet, TextStyle} from 'react-native';
import {useThemeStore} from '@/theme/store';

interface TypographyProps {
  /**
   * Text content to display
   */
  children: React.ReactNode;
  /**
   * Custom styles to override defaults
   */
  style?: TextStyle;
  /**
   * Number of lines to show (optional)
   */
  numberOfLines?: number;
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Heading - Large prominent text for titles and headers
 */
export const Heading: React.FC<TypographyProps> = ({
  children,
  style,
  numberOfLines,
  testID = 'heading',
}) => {
  const {colors, typography} = useThemeStore(state => state.theme);

  return (
    <Text
      style={[
        styles.heading,
        {color: colors.textPrimary, fontSize: typography.skH2.fontSize},
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}>
      {children}
    </Text>
  );
};

/**
 * Subtitle - Secondary text often paired with headings
 */
export const Subtitle: React.FC<TypographyProps> = ({
  children,
  style,
  numberOfLines,
  testID = 'subtitle',
}) => {
  const {colors, typography} = useThemeStore(state => state.theme);

  return (
    <Text
      style={[
        styles.subtitle,
        {color: colors.textPrimary, fontSize: typography.skP1.fontSize},
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}>
      {children}
    </Text>
  );
};

/**
 * StatLabel - Bold text for highlighting statistics or metrics
 */
export const StatLabel: React.FC<TypographyProps> = ({
  children,
  style,
  numberOfLines,
  testID = 'stat-label',
}) => {
  const {colors, typography} = useThemeStore(state => state.theme);

  return (
    <Text
      style={[
        styles.statLabel,
        {color: colors.textSecondary, fontSize: typography.skP2.fontSize},
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}>
      {children}
    </Text>
  );
};

/**
 * StatValue - Smaller text for describing statistics
 */
export const StatValue: React.FC<TypographyProps> = ({
  children,
  style,
  numberOfLines,
  testID = 'stat-value',
}) => {
  const {colors, typography} = useThemeStore(state => state.theme);

  return (
    <Text
      style={[
        styles.statValue,
        {color: colors.textPrimary, fontSize: typography.skH1.fontSize},
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  subtitle: {
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  statLabel: {
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  statValue: {
    fontWeight: '900',
    letterSpacing: 0.1,
  },
});
