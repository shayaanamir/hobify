module.exports = {
  preset: 'react-native', // Use standard react-native preset instead of jest-expo for now
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|@reduxjs/toolkit|immer|lucide-react-native)'
  ],
  setupFiles: ['./jest-setup.js'],
};
