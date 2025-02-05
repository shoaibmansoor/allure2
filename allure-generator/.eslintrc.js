module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [ "prettier"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module",
  },
  plugins: [
    "eslint-plugin-no-null",
    "eslint-plugin-prefer-arrow",
    "eslint-plugin-import",
    "eslint-plugin-jsdoc",
  ],
  rules: {
    "arrow-body-style": "off",
    "arrow-parens": ["off", "always"],
    "brace-style": ["error", "1tbs"],
    complexity: "off",
    "constructor-super": "error",
    curly: "error",
    "eol-last": "error",
    eqeqeq: ["error", "smart"],
    "guard-for-in": "error",
    "id-blacklist": [
      "error",
      "any",
      "Number",
      "number",
      "String",
      "string",
      "Boolean",
      "boolean",
      "Undefined",
      "undefined",
    ],
    "id-match": "error",
    "import/no-default-export": "off",
    "import/no-unassigned-import": "off",
    "import/order": ["error", { alphabetize: { order: "asc", caseInsensitive: true } }],
    "jsdoc/check-alignment": "error",
    "jsdoc/check-indentation": "error",
    "jsdoc/newline-after-description": "error",
    // TODO make max-classes-per-file equal 2
    "max-classes-per-file": ["error", 5],
    "max-len": [
      "error",
      {
        code: 120,
      },
    ],
    // TODO make max-lines equal 300
    "max-lines": ["error", 700],
    "new-parens": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-cond-assign": "error",
    // "no-console": "error",
    // "no-debugger": "error",
    "no-empty": "off",
    "no-eval": "error",
    "no-fallthrough": "off",
    "no-invalid-this": "off",
    "no-multiple-empty-lines": "error",
    "no-new-wrappers": "error",
    "no-null/no-null": "off",
    "no-restricted-imports": ["error", "rxjs"],
    "no-shadow": [
      "error",
      {
        hoist: "all",
      },
    ],
    "no-throw-literal": "error",
    "no-trailing-spaces": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "error",
    "no-unsafe-finally": "error",
    "no-unused-labels": "error",
    "no-var": "error",
    "object-shorthand": "off",
    "one-var": ["off", "never"],
    "padding-line-between-statements": [
      "off",
      {
        blankLine: "always",
        prev: "*",
        next: "return",
      },
    ],
    "prefer-const": "error",
    "prefer-template": "error",
    // quotes: ["error", { avoidEscape: true }],
    radix: "error",
    "sort-imports": ["error", { ignoreDeclarationSort: true, ignoreCase: true }],
    "space-before-function-paren": [
      "error",
      {
        anonymous: "never",
        asyncArrow: "always",
        named: "never",
      },
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        markers: ["/"],
      },
    ],
    "use-isnan": "error",
    "valid-typeof": "off",
  },
};
