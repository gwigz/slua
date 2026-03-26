import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export const gitConfig = {
  user: "gwigz",
  repo: "slua",
  branch: "main",
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src="/favicon.svg" alt="" width={24} height={24} />
          @gwigz/slua
        </>
      ),
    },
    links: [
      { text: "Docs", url: "/docs/slua" },
      { text: "Playground", url: "/playground" },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    themeSwitch: { enabled: false },
  }
}
