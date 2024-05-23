import globals from 'globals'
import pluginJs from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.browser,
    }
  } },
  pluginJs.configs.recommended,
  {
    plugins: {
      '@stylistic/js': stylisticJs
    }
  },
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      eqeqeq: 'error',
      '@stylistic/js/indent': [
        'error',
        2
      ],
      '@stylistic/js/quotes': [
        'error',
        'single'
      ],
      '@stylistic/js/semi': [
        'error',
        'never'
      ],
      '@stylistic/js/no-trailing-spaces': 'error',
      '@stylistic/js/object-curly-spacing': [
        'error', 'always'
      ],
      '@stylistic/js/arrow-spacing': [
        'error', { 'before': false, 'after': false }
      ],
      'no-console': 0,
    }
  }
]