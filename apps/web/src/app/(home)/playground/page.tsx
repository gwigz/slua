import type { Metadata } from "next"
import { PlaygroundLoader } from "./playground-loader"

export const metadata: Metadata = {
  title: "Playground",
  description: "Interactive TypeScript to SLua transpiler playground",
}

export default function PlaygroundPage() {
  return <PlaygroundLoader />
}
