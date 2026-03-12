module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "reference-erp/**",
      "**/reference-erp/**",
      "**/__MACOSX/**",
    ],
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
];
