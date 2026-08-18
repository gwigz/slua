import { displayName, eachPrim } from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { Reporter } from "../output.js"

export async function objectsCommand(client: ViewerClient, reporter: Reporter): Promise<number> {
  const { objects } = await client.objectList()
  const list = objects ?? []

  reporter.data({
    objects: list.map((object) => ({
      object_id: object.object_id,
      object_name: object.object_name,
      region: object.region,
      prims: eachPrim(object).map((prim) => ({
        prim_id: prim.prim_id,
        name: prim.name,
        items: prim.inventory.map((item) => ({
          item_id: item.item_id,
          name: item.name,
          display_name: displayName(item),
          type: item.type,
          vm: item.vm,
          running: item.running,
        })),
      })),
    })),
  })

  if (list.length === 0) {
    reporter.note("no published objects — select one in the viewer, or pass a UUID to push")

    return 0
  }

  for (const object of list) {
    reporter.line(`${object.object_name}  ${object.object_id}`)

    for (const prim of eachPrim(object)) {
      if (prim.prim_id !== object.object_id) {
        reporter.line(`  ${prim.name}  ${prim.prim_id}`)
      }

      for (const item of prim.inventory) {
        const state = item.type === "script" ? (item.running ? "running" : "stopped") : item.type

        reporter.line(`    ${displayName(item)}  ${state}`)
      }
    }
  }

  return 0
}
