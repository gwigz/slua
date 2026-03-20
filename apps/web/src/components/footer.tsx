import { IconBrandGithub } from "@tabler/icons-react"
import { Separator } from "~/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] py-8 px-6">
      <Separator className="bg-white/[0.06] mb-8" />
      <div className="max-w-5xl mx-auto flex items-center justify-center">
        <a
          href="https://github.com/gwigz/slua"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconBrandGithub size={16} />
        </a>
      </div>
    </footer>
  )
}
