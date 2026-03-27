"use client"

import dynamic from "next/dynamic"

const JsonPlayground = dynamic(
  () => import("~/components/json-playground").then((mod) => mod.JsonPlayground),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading playground...</p>
      </div>
    ),
  },
)

export function JsonPlaygroundLoader() {
  return <JsonPlayground />
}
