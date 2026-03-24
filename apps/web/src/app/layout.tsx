import { Inter } from "next/font/google"
import { Provider } from "~/components/provider"
import type { Metadata } from "next"
import "@fontsource-variable/sora"
import "@fontsource/fira-code/400.css"
import "@fontsource/fira-code/500.css"
import "./global.css"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "@gwigz/slua",
    template: "%s | @gwigz/slua",
  },
  description: "TypeScript for SLua",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.className} dark`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
