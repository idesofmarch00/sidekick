module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Disable inline styles warning
    'react-native/no-inline-styles': 'off',

    // Show warnings for TypeScript 'any' type
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
