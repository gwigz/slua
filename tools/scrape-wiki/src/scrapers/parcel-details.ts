import { scrapeConstantList } from "../parse-params.js"
import type { TypedListArg, TypedListParamSet } from "../types.js"

const returns: Record<string, TypedListArg[]> = {
  PARCEL_DETAILS_NAME: [{ type: "string", name: "name" }],
  PARCEL_DETAILS_DESC: [{ type: "string", name: "desc" }],
  PARCEL_DETAILS_OWNER: [{ type: "key", name: "owner" }],
  PARCEL_DETAILS_GROUP: [{ type: "key", name: "group" }],
  PARCEL_DETAILS_AREA: [{ type: "integer", name: "area" }],
  PARCEL_DETAILS_ID: [{ type: "key", name: "id" }],
  PARCEL_DETAILS_SEE_AVATARS: [{ type: "boolean", name: "seeAvatars" }],
  PARCEL_DETAILS_PRIM_CAPACITY: [{ type: "integer", name: "primCapacity" }],
  PARCEL_DETAILS_PRIM_USED: [{ type: "integer", name: "primUsed" }],
  PARCEL_DETAILS_LANDING_POINT: [{ type: "vector", name: "landingPoint" }],
  PARCEL_DETAILS_LANDING_LOOKAT: [{ type: "vector", name: "landingLookat" }],
  PARCEL_DETAILS_TP_ROUTING: [{ type: "integer", name: "tpRouting" }],
  PARCEL_DETAILS_FLAGS: [{ type: "integer", name: "flags" }],
  PARCEL_DETAILS_SCRIPT_DANGER: [{ type: "boolean", name: "scriptDanger" }],
}

export async function scrapeParcelDetails(): Promise<TypedListParamSet[]> {
  return scrapeConstantList({
    url: "https://wiki.secondlife.com/wiki/LlGetParcelDetails",
    landmarks: ["PARCEL_DETAILS_NAME", "PARCEL_DETAILS_OWNER"],
    prefix: "PARCEL_DETAILS_",
    name: "ParcelDetail",
    functions: ["llGetParcelDetails"],
    returns,
    descCol: 2,
  })
}
