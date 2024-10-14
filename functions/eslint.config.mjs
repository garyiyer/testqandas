import {FlatCompat} from "@eslint/eslintrc";
import js from "@eslint/js";
import google from "eslint-config-google";

export default [
  js.configs.recommended,
  google,
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      globals: {
        // Define your globals here
      },
    },
    rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", { "allowTemplateLiterals": true }],
      "no-html-link-for-pages": "off",
      // Ensure valid-jsdoc is not listed here
    },
  },
];