import 'react-native-gesture-handler/jestSetup';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const animatedComponent = (c: any) => c;
  return {
    default: {
      call: jest.fn(),
      createAnimatedComponent: animatedComponent,
      addWhitelistedUIProps: jest.fn(),
    },
    createAnimatedComponent: animatedComponent,
    addWhitelistedUIProps: jest.fn(),
    useSharedValue: (val) => ({ value: val }),
    useAnimatedStyle: (cb) => ({}),
    useAnimatedProps: (cb) => ({}),
    useAnimatedScrollHandler: (cb) => () => {},
    useAnimatedGestureHandler: (cb) => () => {},
    withTiming: (toValue) => toValue,
    withSpring: (toValue) => toValue,
    withDecay: () => 0,
    cancelAnimation: () => {},
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    interpolate: () => 0,
    Extrapolate: { CLAMP: 'clamp' },
    Extrapolation: { CLAMP: 'clamp' },
    Easing: {
      linear: (x) => x,
      ease: (x) => x,
      quad: (x) => x,
      bezier: () => ({ factory: (x) => x }),
      in: (x) => x,
      out: (x) => x,
      inOut: (x) => x,
    },
    Layout: {
      springify: () => ({
        damping: () => ({
          mass: () => ({}),
        }),
      }),
    },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    SlideInRight: { duration: () => ({}) },
    SlideOutLeft: { duration: () => ({}) },
  };
});

// Mock Geolocation
jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    requestAuthorization: jest.fn(),
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
}));

// Mock Permissions
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

// Mock Vision Camera
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => ({}),
}));

// Mock WebView
jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: () => React.createElement(View),
  };
});

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    addOnValueChangedListener: jest.fn(),
  })),
}));

// Mock Firebase App and Auth
jest.mock('@react-native-firebase/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('@react-native-firebase/auth', () => () => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
}));

// Mock Easebuzz Kit
jest.mock('react-native-easebuzz-kit', () => ({
  default: {
    pay: jest.fn(),
  },
}));

// Mock Vector Icons
jest.mock('react-native-vector-icons/feather', () => 'Icon');

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => inset,
  };
});

// Mock Toast Message
jest.mock('react-native-toast-message', () => {
  const React = require('react');
  return {
    default: () => null,
    show: jest.fn(),
    hide: jest.fn(),
  };
});

// Mock React Native Maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  class MockMapView extends React.Component {
    render() {
      return React.createElement(View, this.props, this.props.children);
    }
  }
  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: 'google',
    Marker: () => null,
    Polyline: () => null,
  };
});

// Mock React Native Modal
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ isVisible, children }: any) => {
      if (!isVisible) return null;
      return React.createElement(View, {}, children);
    },
  };
});

// Mock rn-swipe-button
jest.mock('rn-swipe-button', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View),
  };
});

// Mock react-native-maps-directions
jest.mock('react-native-maps-directions', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View),
  };
});

