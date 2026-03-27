"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"

import { cn } from "~/lib/cn"

function Toggle({ className, children, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        "border border-fd-border bg-transparent text-fd-muted-foreground",
        "hover:bg-fd-muted hover:text-fd-foreground",
        "data-pressed:bg-fd-accent data-pressed:text-fd-accent-foreground data-pressed:border-fd-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { Toggle }
