import { Link, useLocation } from "react-router"
import { IconBrandGithub } from "@tabler/icons-react"

export function Nav() {
  const location = useLocation()
  const isPlayground = location.pathname === "/playground"

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
      <Link
        to="/"
        className="font-display text-sm font-semibold tracking-tight text-foreground hover:text-white transition-colors"
      >
        @gwigz/slua
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to={isPlayground ? "/" : "/playground"}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isPlayground ? "Home" : "Playground"}
        </Link>
        <a
          href="https://github.com/gwigz/slua"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconBrandGithub size={18} />
        </a>
      </div>
    </nav>
  )
}
