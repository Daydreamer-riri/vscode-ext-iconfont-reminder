// process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = {
  extends: '@ririd',
  rules: {
    'no-cond-assign': 'off',
    'array-callback-return': ['error', { allowImplicit: true }],
  },
  ignorePatterns: [
    'out',
    'dist',
    '**/*.d.ts',
    'test',
  ],
}
