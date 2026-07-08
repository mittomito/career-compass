import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '.firebase', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React Compiler 世代の新しい厳格ルール。既存コードの動作するパターン
      // （effect 内の同期 setState / レンダー中の ref 代入）を検出するため、
      // リファクタで解消するまでは warn にベースライン化しておく
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      // Vite の HMR を効かせるための警告（コンポーネント以外の export を検出）
      'react-refresh/only-export-components': 'warn',
      // _ 始まりの変数・引数と rest 展開の余り（const { id: _drop, ...rest }）は未使用を許容
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
)
