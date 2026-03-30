"use client"

import { useRouter } from "next/navigation"
import { IconCode, IconBraces } from "@tabler/icons-react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"

const tabs = [
  { value: "typescript", label: "TypeScript", icon: IconCode, href: "/playground" },
  { value: "json", label: "JSON", icon: IconBraces, href: "/playground/json" },
] as const

export function PlaygroundTabs({ activeTab }: { activeTab: "typescript" | "json" }) {
  const router = useRouter()

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const tab = tabs.find((t) => t.value === value)
        if (tab) router.push(tab.href)
      }}
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="">
            <tab.icon className="size-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
