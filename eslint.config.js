import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "out/**",
      "scripts/**",
      "**/debug-*.js",
      "**/*.config.js",
      "**/postcss.config.*",
      "**/tailwind.config.*",
      "debug-clientes.js"
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "scripts/**",
      "**/debug-*.js",
      "debug-clientes.js",
      "**/*.config.js"
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: ["./tsconfig.json"],
      },
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'jsx-a11y/anchor-is-valid': 'warn',
      'no-undef': 'off', // Desabilitar verificação de variáveis não definidas para evitar problemas com require()
      '@typescript-eslint/no-require-imports': 'off', // Permitir require() em arquivos .js
      'no-restricted-globals': 'off', // Permitir require como global
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]; 