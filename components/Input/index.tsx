// src/components/Input/Input.tsx
import React, {useState, useRef} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Modal,
  FlatList,
  KeyboardTypeOptions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useThemeStore} from '@/theme/store';

// Define the variant types our input supports
type InputVariant = 'default' | 'dropdown' | 'phone' | 'currency';

// Define dropdown option interface for dropdown variant
interface DropdownOption {
  label: string;
  value: string;
}

// Extend the TextInputProps with our custom props
interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label/title displayed above the input
   */
  title?: string;

  /**
   * Variant of the input to display
   */
  variant?: InputVariant;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom input style
   */
  inputStyle?: TextStyle;

  /**
   * Custom label/title style
   */
  titleStyle?: TextStyle;

  /**
   * Error message to display below the input
   */
  error?: string;

  /**
   * Whether the input is required
   */
  required?: boolean;

  /**
   * Options for dropdown variant
   */
  dropdownOptions?: DropdownOption[];

  /**
   * Callback when dropdown option is selected
   */
  onSelectDropdownOption?: (option: DropdownOption) => void;

  /**
   * Country code for phone variant (default: +91)
   */
  countryCode?: string;

  /**
   * Type of input (text, numeric, etc.)
   */
  inputType?: 'text' | 'numeric' | 'email' | 'password';

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Custom Input component with multiple variants: default, dropdown, phone, and currency
 */
const Input: React.FC<InputProps> = ({
  title,
  variant = 'default',
  containerStyle,
  inputStyle,
  titleStyle,
  error,
  required = false,
  dropdownOptions = [],
  onSelectDropdownOption,
  countryCode = '+91',
  inputType = 'text',
  placeholder = '',
  value,
  onChangeText,
  testID = 'custom-input',
  ...restProps
}) => {
  // Access theme values
  const {colors, spacing, typography} = useThemeStore(state => state.theme);

  // State for dropdown modal
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Reference to the input for focusing
  const inputRef = useRef<TextInput>(null);

  // Determine keyboard type based on inputType
  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (inputType) {
      case 'numeric':
        return 'numeric';
      case 'email':
        return 'email-address';
      case 'password':
        return 'default'; // Password doesn't have a specific keyboard type
      default:
        return 'default';
    }
  };

  // Handle dropdown option selection
  const handleSelectOption = (option: DropdownOption) => {
    if (onSelectDropdownOption) {
      onSelectDropdownOption(option);
      if (onChangeText) {
        onChangeText(option.value);
      }
    }
    setDropdownVisible(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (variant === 'dropdown') {
      setDropdownVisible(!dropdownVisible);
    }
  };

  // Render dropdown icon
  const renderDropdownIcon = () => {
    if (variant === 'dropdown') {
      return (
        <TouchableOpacity
          onPress={toggleDropdown}
          style={styles.dropdownIconContainer}
          testID={`${testID}-dropdown-icon`}
          accessibilityLabel="Toggle dropdown"
          accessibilityRole="button">
          <Icon name="chevron-down" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Render currency prefix for currency variant
  const renderCurrencyPrefix = () => {
    if (variant === 'currency') {
      return (
        <View style={styles.phonePrefixContainer}>
          <Text
            style={[
              styles.prefixText,
              {color: colors.highlight, fontSize: typography.skP2.fontSize},
            ]}>
            ₹
          </Text>
          <View
            style={[styles.divider, {backgroundColor: colors.textSecondary}]}
          />
        </View>
      );
    }
    return null;
  };

  // Render phone prefix for phone variant
  const renderPhonePrefix = () => {
    if (variant === 'phone') {
      return (
        <View style={styles.phonePrefixContainer}>
          <Text
            style={[
              styles.prefixText,
              {color: colors.highlight, fontSize: typography.skP2.fontSize},
            ]}>
            {countryCode}
          </Text>
          <View
            style={[styles.divider, {backgroundColor: colors.textSecondary}]}
          />
        </View>
      );
    }
    return null;
  };

  // Render dropdown modal
  const renderDropdownModal = () => {
    if (variant !== 'dropdown') return null;

    return (
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}>
          <View
            style={[
              styles.dropdownContainer,
              {
                top: 200, // This should be calculated based on input position
                backgroundColor: colors.white,
                borderRadius: 20,
                borderColor: colors.textSecondary,
              },
            ]}>
            <FlatList
              data={dropdownOptions}
              keyExtractor={item => item.value}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    {borderBottomColor: colors.lightGray},
                  ]}
                  onPress={() => handleSelectOption(item)}>
                  <Text style={{color: colors.textPrimary}}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Title/Label */}
      {title && (
        <Text
          style={[
            styles.title,
            {
              color:
                variant === 'currency' ? colors.highlight : colors.textPrimary,
              fontSize: typography.skP2.fontSize,
              fontWeight: '500',
            },
            titleStyle,
          ]}>
          {title}
          {required && <Text style={{color: colors.error}}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.error : colors.textSecondary,
            borderRadius: 20,
            backgroundColor: colors.white,
          },
        ]}>
        {/* Phone Prefix */}
        {renderPhonePrefix()}

        {/* Currency Prefix */}
        {renderCurrencyPrefix()}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontSize: typography.skP2.fontSize,
              paddingLeft:
                variant === 'phone' || variant === 'currency'
                  ? spacing.xs
                  : spacing.md,
              textAlign: variant === 'currency' ? 'right' : 'left',
              flex: 1,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.error}
          value={value}
          onChangeText={onChangeText}
          keyboardType={getKeyboardType()}
          secureTextEntry={inputType === 'password'}
          onFocus={() => variant === 'dropdown' && setDropdownVisible(false)}
          {...restProps}
        />

        {/* Dropdown Icon */}
        {renderDropdownIcon()}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.error,
              fontSize: typography.skP3.fontSize,
            },
          ]}>
          {error}
        </Text>
      )}

      {/* Dropdown Modal */}
      {renderDropdownModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 10,
    marginLeft: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    height: 64,
    overflow: 'hidden',
  },
  input: {
    paddingRight: 16,
  },
  dropdownIconContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePrefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  prefixText: {
    fontWeight: '500',
    marginRight: 8,
  },
  divider: {
    width: 2,
    height: 20,
    marginRight: 6,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    maxHeight: 200,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
});

export default Input;
