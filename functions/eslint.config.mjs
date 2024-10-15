import js from "@eslint/js";
import googleConfig from "eslint-config-google";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      ...googleConfig.rules,
      "linebreak-style": "off", // Turn off linebreak style checking
      "object-curly-spacing": ["error", "always"],
      "quotes": ["error", "double"],
      "max-len": ["error", { "code": 100 }],
    },
  },
];
