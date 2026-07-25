// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const reactNativeA11y = require("eslint-plugin-react-native-a11y");

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      "react-native-a11y": reactNativeA11y,
    },
    rules: {
      ...reactNativeA11y.configs.all.rules,
    },
    ignores: ["dist/*"],
  }
]);
