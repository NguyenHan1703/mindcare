// eslint.config.js
import parser from '@babel/eslint-parser'
import reactPlugin from 'eslint-plugin-react'

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'], // 👈 Cái này quan trọng
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
