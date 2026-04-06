import { writeFileSync } from "fs"
import { resolve } from "path"
import type { TypedListParams } from "./types.js"
import { scrapePrimParams } from "./scrapers/prim-params.js"
import { scrapeHttpParams } from "./scrapers/http-params.js"
import { scrapeParticleSystem } from "./scrapers/particle-system.js"
import { scrapeCameraParams } from "./scrapers/camera-params.js"
import { scrapeCastRay } from "./scrapers/cast-ray.js"
import { scrapeCharacter } from "./scrapers/character.js"
import { scrapeRezParams } from "./scrapers/rez-params.js"
import { scrapeObjectDetails } from "./scrapers/object-details.js"
import { scrapeParcelDetails } from "./scrapers/parcel-details.js"
import { scrapeGltfOverrides } from "./scrapers/gltf-overrides.js"

async function main() {
  const results = await Promise.all([
    scrapePrimParams(),
    scrapeHttpParams(),
    scrapeParticleSystem(),
    scrapeCameraParams(),
    scrapeCastRay(),
    scrapeCharacter(),
    scrapeRezParams(),
    scrapeObjectDetails(),
    scrapeParcelDetails(),
    scrapeGltfOverrides(),
  ])

  const sets = results.flat()

  const output: TypedListParams = { sets }

  const outPath = resolve(import.meta.dir, "../../../refs/typed-list-params.json")
  writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8")

  const totalRules = sets.reduce(
    (n, s) => n + s.params.length + (s.subDispatch?.params.length ?? 0),
    0,
  )
  console.log(`Written ${sets.length} sets (${totalRules} rules) to ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
