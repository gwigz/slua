import { useEffect, type RefObject } from "react"

export function useTwoslashPortal(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const portal = document.createElement("div")
    portal.className = "twoslash-portal"
    portal.style.cssText = "position:fixed;z-index:50;display:none"
    document.body.appendChild(portal)

    const ac = new AbortController()

    for (const hover of el.querySelectorAll<HTMLElement>(".twoslash-hover")) {
      const popup = hover.querySelector<HTMLElement>(".twoslash-popup-container")
      if (!popup) continue

      hover.addEventListener(
        "mouseenter",
        () => {
          const rect = hover.getBoundingClientRect()
          portal.innerHTML = popup.outerHTML
          const clone = portal.firstElementChild as HTMLElement
          clone.style.opacity = "1"
          clone.style.pointerEvents = "auto"
          clone.style.position = "static"
          clone.style.transform = "none"
          clone.style.maxWidth = "none"
          clone.style.maxHeight = "none"
          clone.style.overflow = "visible"
          portal.style.left = `${rect.left}px`
          portal.style.top = `${rect.bottom + 4}px`
          portal.style.display = ""
        },
        { signal: ac.signal },
      )

      hover.addEventListener(
        "mouseleave",
        () => {
          portal.style.display = "none"
        },
        { signal: ac.signal },
      )
    }

    return () => {
      ac.abort()
      portal.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
