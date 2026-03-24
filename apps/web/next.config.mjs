import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: ["@takumi-rs/image-response", "shiki", "@shikijs/twoslash", "twoslash"],
  output: "export",
  reactStrictMode: true,
}

export default withMDX(config)
