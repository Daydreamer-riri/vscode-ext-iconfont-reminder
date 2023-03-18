// process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = {
  extends: '@ririd',
  rules: {
    'no-cond-assign': 'off',
  },
  ignorePatterns: [
    'out',
    'dist',
    '**/*.d.ts',
    'test',
  ],
}
