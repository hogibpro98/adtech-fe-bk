module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "prettier",
    "prettier/vue",
    "plugin:prettier/recommended"
  ],
  plugins: ["prettier"],
  // add your custom rules here
  rules: {
    "no-console": 0,
    camelcase: 0,
    "vue/require-component-is": 0,
    "vue/no-parsing-error": 0,
    "vue/no-unused-vars": 1,
    "no-trailing-spaces": 1,
    "vue/comment-directive": 0,
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto"
      }
    ]
  }
};
