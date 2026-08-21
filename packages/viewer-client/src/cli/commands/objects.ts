import pc from "picocolors"
import {
  displayName,
  eachPrim,
  listPublished,
  PUBLISH_HINT,
  type PublishOptions,
} from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { Reporter } from "../output.js"

export async function objectsCommand(
  client: ViewerClient,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  // Nothing is published until the viewer's publish button is pressed, and it
  // only publishes to a client already connected, so waiting here is what
  // makes that button work.
  const list = await listPublished(client, publish)

  reporter.data({
    objects: list.map((object) => ({
      objectId: object.objectId,
      objectName: object.objectName,
      // Description keys are how targets pin to an object, so hiding them
      // would hide what `link` stamped.
      objectDescription: object.objectDescription ?? "",
      region: object.region,
      canSaveBack: object.canSaveBack,
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
    reporter.note(`no published objects — ${PUBLISH_HINT}`)

    return 0
  }

  for (const object of list) {
    reporter.line(`${object.objectName}  ${object.objectId}`)

    if (object.objectDescription) {
      reporter.line(`  ${pc.dim(object.objectDescription)}`)
    }

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
