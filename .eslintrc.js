module.exports = {
  extends: [
    'next/core-web-vitals',
    'prettier',
  ],
  rules: {
    // Add custom rules here
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
  },
}; 