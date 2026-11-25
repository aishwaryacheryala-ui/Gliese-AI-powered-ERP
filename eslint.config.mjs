export default [
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        process: "readonly",
        URL: "readonly",
        Blob: "readonly",
        FormData: "readonly",
        Intl: "readonly",
        Date: "readonly",
        Math: "readonly"
      }
    },
    rules: {
      "no-undef": "warn",
      "no-unused-vars": "off"
    }
  }
];
