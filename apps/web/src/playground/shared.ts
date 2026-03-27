"use client"

import { useEffect, useState } from "react"

export const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontFamily: "'Fira Code', monospace",
  fontLigatures: true,
  fontSize: 13,
  lineNumbers: "on" as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
}

export function useMonacoTheme() {
  const [theme, setTheme] = useState<string>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "vitesse-dark"
      : "vitesse-light",
  )

  useEffect(() => {
    const update = () =>
      setTheme(
        document.documentElement.classList.contains("dark") ? "vitesse-dark" : "vitesse-light",
      )

    const observer = new MutationObserver(update)

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

  return theme
}
