import type { Metadata } from "next"
import { PlaygroundLoader } from "./playground-loader"

export const metadata: Metadata = {
  title: "Playground",
  description: "Transpile TypeScript to SLua in the browser.",
}

export default function PlaygroundPage() {
  return <PlaygroundLoader />
}
