import { source } from "~/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "~/lib/layout.shared"

const TAB_ICON_COLORS: Record<string, string> = {
  "/docs/slua": "text-blue-400",
  "/docs/modules": "text-purple-400",
  "/docs/create": "text-green-400",
  "/docs/viewer-client": "text-sky-400",
  "/docs/json": "text-amber-400",
}

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      links={[]}
      tabMode="auto"
      // The scope is already `@gwigz`, repeating it on every entry just wraps the labels.
      tabs={{
        transform: (option) => {
          const color = TAB_ICON_COLORS[option.url]

          return {
            ...option,
            title:
              typeof option.title === "string"
                ? option.title.replace(/^@gwigz\//, "")
                : option.title,
            icon: color ? <span className={color}>{option.icon}</span> : option.icon,
          }
        },
      }}
    >
      {children}
    </DocsLayout>
  )
}
