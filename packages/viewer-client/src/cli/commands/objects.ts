import { displayName, eachPrim } from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { Reporter } from "../output.js"

export async function objectsCommand(client: ViewerClient, reporter: Reporter): Promise<number> {
  const { objects } = await client.objectList()
  const list = objects ?? []

  reporter.data({
    objects: list.map((object) => ({
      objectId: object.objectId,
      objectName: object.objectName,
      region: object.region,
      prims: eachPrim(object).map((prim) => ({
        primId: prim.primId,
        name: prim.name,
        items: prim.inventory.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          displayName: displayName(item),
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
    reporter.line(`${object.objectName}  ${object.objectId}`)

    for (const prim of eachPrim(object)) {
      if (prim.primId !== object.objectId) {
        reporter.line(`  ${prim.name}  ${prim.primId}`)
      }

      for (const item of prim.inventory) {
        const state = item.type === "script" ? (item.running ? "running" : "stopped") : item.type

        reporter.line(`    ${displayName(item)}  ${state}`)
      }
    }
  }

  return 0
}
