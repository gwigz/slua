import { describe, it, expect } from "bun:test"
import { expandBuilderRuleset, expandTableRulesets, rulesetTableType } from "../rulesets.js"
import type { LSLConstant, LSLDefinitions } from "../types.js"

function constant(value: number, memberOf: string, extra: Partial<LSLConstant> = {}): LSLConstant {
  return { type: "integer", value: String(value), "member-of": [memberOf], ...extra }
}

function definitions(overrides: Partial<LSLDefinitions>): LSLDefinitions {
  return { constants: {}, functions: {}, events: {}, enums: {}, builderRulesets: {}, ...overrides }
}

describe("expandTableRulesets", () => {
  it("strips the prefix, drops filler tokens, and sorts by name", () => {
    const lsl = definitions({
      enums: { ParticleParam: { type: "param-dict", prefix: "PSYS_" } },
      constants: {
        PSYS_SRC_TEXTURE: constant(2, "ParticleParam", { "value-type": "asset" }),
        PSYS_PART_MAX_AGE: constant(1, "ParticleParam", { "value-type": "float", tooltip: "Age." }),
      },
      builderRulesets: {
        "particle-params": {
          type: "table",
          enum: "ParticleParam",
          "lua-type": "ParticleParams",
          "filler-tokens": ["part", "src"],
        },
      },
    })

    expect(expandTableRulesets(lsl).get("ParticleParams")).toEqual([
      { name: "maxAge", luaName: "max_age", type: "number?", comment: "Age." },
      { name: "texture", luaName: "texture", type: "(string | uuid)?" },
    ])
  })

  it("reverts colliding auto-derived names to strict names", () => {
    const lsl = definitions({
      enums: { Param: { type: "param-dict", prefix: "P_" } },
      constants: {
        P_SRC_AGE: constant(1, "Param", { "value-type": "float" }),
        P_PART_AGE: constant(2, "Param", { "value-type": "float" }),
      },
      builderRulesets: {
        params: {
          type: "table",
          enum: "Param",
          "lua-type": "Params",
          "filler-tokens": ["part", "src"],
        },
      },
    })

    const names = expandTableRulesets(lsl)
      .get("Params")!
      .map((property) => property.luaName)

    expect(names).toEqual(["part_age", "src_age"])
  })

  it("prefers pretty-name and adds a boolean per flag", () => {
    const lsl = definitions({
      enums: {
        HttpParam: { type: "param-dict", prefix: "HTTP_" },
        HttpFlag: { type: "flag", prefix: "FLAG_" },
      },
      constants: {
        HTTP_BODY_MAXLENGTH: constant(1, "HttpParam", {
          "value-type": "integer",
          "pretty-name": "max_body_length",
        }),
        FLAG_EMISSIVE_MASK: constant(1, "HttpFlag"),
        FLAG_HIDDEN: constant(2, "HttpFlag", { private: true }),
      },
      builderRulesets: {
        http: {
          type: "table",
          enum: "HttpParam",
          "lua-type": "HttpParams",
          "flag-enum": "HttpFlag",
          "flag-mask": "_MASK",
        },
      },
    })

    expect(expandTableRulesets(lsl).get("HttpParams")).toEqual([
      { name: "emissive", luaName: "emissive", type: "boolean?" },
      { name: "maxBodyLength", luaName: "max_body_length", type: "number?" },
    ])
  })

  it("throws when two keys share a camelCase name", () => {
    const lsl = definitions({
      enums: { Param: { type: "param-dict", prefix: "P_" } },
      constants: {
        P_MAX_AGE: constant(1, "Param", { "value-type": "float" }),
        P_MAX__AGE: constant(2, "Param", { "value-type": "float" }),
      },
      builderRulesets: { params: { type: "table", enum: "Param", "lua-type": "Params" } },
    })

    expect(() => expandTableRulesets(lsl)).toThrow("camelCase key collision in Params: maxAge")
  })

  it("throws when a member has no value-type", () => {
    const lsl = definitions({
      enums: { Param: { type: "param-dict", prefix: "P_" } },
      constants: { P_AGE: constant(1, "Param") },
      builderRulesets: { params: { type: "table", enum: "Param", "lua-type": "Params" } },
    })

    expect(() => expandTableRulesets(lsl)).toThrow("has no value-type")
  })
})

describe("rulesetTableType", () => {
  it("resolves a ruleset to its lua-type", () => {
    const lsl = definitions({
      builderRulesets: { params: { type: "table", enum: "Param", "lua-type": "Params" } },
    })

    expect(rulesetTableType(lsl, "params")).toBe("Params")
    expect(rulesetTableType(lsl, undefined)).toBeUndefined()
    expect(() => rulesetTableType(lsl, "missing")).toThrow("Unknown ruleset missing")
  })
})

describe("expandBuilderRuleset", () => {
  const lsl = definitions({
    enums: {
      PrimParam: { type: "param-list", prefix: "PRIM_" },
      PrimType: { type: "enum", prefix: "PRIM_TYPE_" },
    },
    constants: {
      PRIM_POSITION: constant(6, "PrimParam", { tooltip: "Position." }),
      PRIM_TYPE_SCULPT: constant(7, "PrimType", { tooltip: "Sculpt." }),
    },
    builderRulesets: {
      "prim-params": {
        type: "builder",
        enum: "PrimParam",
        rules: {
          POSITION: { "method-name": "pos", params: [["vector", "position"]] },
          GLTF_NORMAL: {
            "face-target": true,
            nullable: true,
            params: [["asset", "texture"]],
          },
          TYPE: {
            params: [["integer", "prim_type"]],
            "variant-enum": "PrimType",
            variants: [{ "applies-to": ["SCULPT"], params: [["integer", "sculpt_type"]] }],
          },
        },
      },
    },
  })

  it("expands rules and variants into fluent methods returning this", () => {
    expect(expandBuilderRuleset(lsl, "prim-params")).toEqual([
      {
        name: "pos",
        comment: "Position.",
        parameters: [{ name: "self" }, { name: "position", type: "vector" }],
        returnType: "this",
      },
      {
        name: "gltfNormal",
        parameters: [
          { name: "self" },
          { name: "face", type: "number" },
          { name: "texture", type: '(string | uuid) | ""' },
        ],
        returnType: "this",
      },
      {
        name: "primTypeSculpt",
        comment: "Sculpt.",
        parameters: [{ name: "self" }, { name: "sculpt_type", type: "number" }],
        returnType: "this",
      },
    ])
  })

  it("throws on unknown param types", () => {
    const broken = definitions({
      enums: lsl.enums,
      builderRulesets: {
        "prim-params": {
          type: "builder",
          enum: "PrimParam",
          rules: { NAME: { params: [["text", "name"]] } },
        },
      },
    })

    expect(() => expandBuilderRuleset(broken, "prim-params")).toThrow("Unknown builder param type")
  })
})
