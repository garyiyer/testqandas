import js from "@eslint/js";
import globals from "globals";
import googleConfig from "eslint-config-google";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    ignores: ["node_modules/**", "dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...googleConfig.rules,
      "linebreak-style": "off",
      "object-curly-spacing": ["error", "always"],
      "quotes": ["error", "double"],
      "max-len": ["error", { "code": 110 }],
      "require-jsdoc": "off",
    },
  },
];
