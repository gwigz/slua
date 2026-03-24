"use client"

import dynamic from "next/dynamic"

const Playground = dynamic(() => import("~/components/playground"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-sm text-fd-muted-foreground">
      Loading playground...
    </div>
  ),
})

export function PlaygroundLoader() {
  return <Playground />
}
