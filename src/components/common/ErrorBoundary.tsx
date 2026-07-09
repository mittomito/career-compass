import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * 描画中の予期しない例外でアプリ全体が白画面になるのを防ぐ最後の砦。
 * 通常時は children をそのまま描画し、例外発生時のみ再読み込みを促す画面を出す。
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('予期しないエラーが発生しました', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="w-[400px] max-w-full rounded-[20px] border border-line bg-white px-10 py-10 text-center shadow-lift">
          <h1 className="text-lg font-extrabold text-ink">エラーが発生しました</h1>
          <p className="mt-2 text-sm text-ink-sub">
            申し訳ありません。予期しないエラーが発生しました。ページを再読み込みしてもう一度お試しください。
          </p>
          <button
            type="button"
            className="btn-primary mt-6 flex w-full justify-center rounded-xl py-3 text-base"
            onClick={() => window.location.reload()}
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }
}
