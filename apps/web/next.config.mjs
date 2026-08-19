import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: [
    "@takumi-rs/image-response",
    "@takumi-rs/core",
    "takumi-js",
    "shiki",
    "@shikijs/twoslash",
    "twoslash",
  ],
  output: "export",
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
}

export default withMDX(config)
