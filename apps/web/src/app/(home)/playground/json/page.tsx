import type { Metadata } from "next"
import { JsonPlaygroundLoader } from "./json-playground-loader"

export const metadata: Metadata = {
  title: "JSON Playground",
  description: "Convert JSON to slencode in the browser.",
}

export default function JsonPlaygroundPage() {
  return <JsonPlaygroundLoader />
}
