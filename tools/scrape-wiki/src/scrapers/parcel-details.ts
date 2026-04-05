import { scrapeConstantList } from "../parse-params.js"
import type { TypedListParamSet } from "../types.js"

export async function scrapeParcelDetails(): Promise<TypedListParamSet[]> {
  return scrapeConstantList({
    url: "https://wiki.secondlife.com/wiki/LlGetParcelDetails",
    landmarks: ["PARCEL_DETAILS_NAME", "PARCEL_DETAILS_OWNER"],
    prefix: "PARCEL_DETAILS_",
    name: "ParcelDetail",
    functions: ["llGetParcelDetails"],
  })
}
