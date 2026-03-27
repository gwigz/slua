import type { Metadata } from "next"
import { JsonPlaygroundLoader } from "./json-playground-loader"

export const metadata: Metadata = {
  title: "JSON Playground",
  description: "Interactive JSON to slencode converter playground",
}

export default function JsonPlaygroundPage() {
  return <JsonPlaygroundLoader />
}
