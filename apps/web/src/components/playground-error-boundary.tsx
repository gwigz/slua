"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class PlaygroundErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[playground] render error:", error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-fd-background text-fd-foreground">
        <div className="max-w-2xl w-full text-xs font-mono text-red-400">
          <div className="mb-2 font-medium">Playground crashed</div>
          <div className="opacity-80 wrap-break-word whitespace-pre-wrap">
            {this.state.error.message}
          </div>
          {this.state.error.stack && (
            <details className="mt-3 opacity-60">
              <summary className="cursor-pointer">Stack trace</summary>
              <pre className="mt-1 text-[10px] whitespace-pre-wrap wrap-break-word">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
