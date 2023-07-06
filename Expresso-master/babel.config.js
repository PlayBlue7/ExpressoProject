module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-paper/babel', "nativewind/babel", 'react-native-reanimated/plugin'], // PLUGINS GO HERE
  // reanimated must be last plugin
  env: {
    production: {
      plugins: ['react-native-paper/babel',
        "nativewind/babel"],
    },
  },
};
