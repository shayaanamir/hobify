// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  default: { call: jest.fn() },
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withTiming: jest.fn(),
  withSpring: jest.fn(),
}));

// Mock SVG
jest.mock('react-native-svg', () => {
  const React = require('react');
  const Svg = (props) => React.createElement('Svg', props, props.children);
  const Circle = (props) => React.createElement('Circle', props, props.children);
  return {
    __esModule: true,
    default: Svg,
    Circle,
    Path: (props) => React.createElement('Path', props, props.children),
    G: (props) => React.createElement('G', props, props.children),
    Rect: (props) => React.createElement('Rect', props, props.children),
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  return {
    ChevronRight: (props) => React.createElement('ChevronRight', props),
    Clock: (props) => React.createElement('Clock', props),
    Flame: (props) => React.createElement('Flame', props),
  };
});
