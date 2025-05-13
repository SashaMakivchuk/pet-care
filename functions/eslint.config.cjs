const { defineConfig } = require("eslint/config");
const globals = require("globals");

module.exports = defineConfig([
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2018,
      globals: globals.node,
    },
    rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "warn",
      "quotes": ["warn", "double", { allowTemplateLiterals: true }],
      "semi": ["warn", "always"],
      "indent": ["warn", 2],
      "no-unused-vars": "warn"
    },
  },
  {
    files: ["**/*.spec.js"],
    languageOptions: {
      globals: globals.mocha,
    },
    rules: {},
  },
]);
