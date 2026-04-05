import { scrapeConstantList } from "../parse-params.js"
import type { TypedListParamSet } from "../types.js"

export async function scrapeObjectDetails(): Promise<TypedListParamSet[]> {
  return scrapeConstantList({
    url: "https://wiki.secondlife.com/wiki/LlGetObjectDetails",
    landmarks: ["OBJECT_NAME", "OBJECT_POS", "OBJECT_OWNER"],
    prefix: "OBJECT_",
    name: "ObjectDetail",
    functions: ["llGetObjectDetails"],
  })
}
