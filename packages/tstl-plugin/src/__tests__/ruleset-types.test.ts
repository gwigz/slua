import { describe, it, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import * as ts from "typescript"
import { transpileFull as transpile, initFull, createFullProgram } from "./helpers"
import { checkRulesetKeys, RULESET_DIAGNOSTIC_CODES } from "../ruleset-keys"

const TYPES_PATH = resolve(import.meta.dir, "../../../../packages/types/index.d.ts")

const LANG_EXT_PATH = resolve(
  import.meta.dir,
  "../../../../node_modules/@typescript-to-lua/language-extensions/index.d.ts",
)

initFull(readFileSync(TYPES_PATH, "utf-8"), readFileSync(LANG_EXT_PATH, "utf-8"))

describe("llprim.ParamSetter", () => {
  it("calls new with a dot and chained methods with a colon", () => {
    const lua = transpile(`
      llprim.ParamSetter.new()
        .pos(new Vector(1, 2, 3))
        .color(ALL_SIDES, new Vector(1, 0, 0), 1)
        .targetLink(2)
        .glow(ALL_SIDES, 0.2)
        .apply(LINK_THIS)
    `)

    expect(lua).toContain("llprim.ParamSetter.new():pos(")
    expect(lua).toContain("):color(")
    expect(lua).toContain(":targetLink(2):glow(ALL_SIDES, 0.2):apply(LINK_THIS)")
  })

  it("calls methods on a stored setter with a colon", () => {
    const lua = transpile(`
      const setter = llprim.ParamSetter.new()

      setter.name("lamp")
      setter.apply()
    `)

    expect(lua).toContain('setter:name("lamp")')
    expect(lua).toContain("setter:apply()")
  })
})

function diagnosticsFor(code: string) {
  return checkRulesetKeys(createFullProgram(code)).map((diagnostic) => ({
    code: diagnostic.code,
    text: code.slice(diagnostic.start, diagnostic.start! + diagnostic.length!),
  }))
}

describe("ruleset dict keys", () => {
  it("renames camelCase keys in a dict literal argument", () => {
    const lua = transpile(`
      ll.HTTPRequest(
        "https://example.com",
        { method: "POST", maxBodyLength: 4096, verifyCert: false, accept: ["application/json"] },
        "",
      )
    `)

    expect(lua).toContain(
      '{method = "POST", max_body_length = 4096, verify_cert = false, accept = {"application/json"}}',
    )
  })

  it("keeps the keys of nested string maps", () => {
    const lua = transpile(`
      ll.HTTPRequest("https://example.com", { customHeader: { "X-Token": "abc", maxBodyLength: "1" } }, "")
    `)

    expect(lua).toContain('{custom_header = {["X-Token"] = "abc", maxBodyLength = "1"}}')
  })

  it("renames typed literals, spreads, and returns", () => {
    const lua = transpile(`
      declare const base: HttpRequestParams
      const params: HttpRequestParams = { ...base, userAgent: "bot" }
      function defaults(): CameraParams {
        return { focusLag: 0.1, positionLocked: true }
      }
    `)

    expect(lua).toContain('__TS__ObjectAssign({}, base, {user_agent = "bot"})')
    expect(lua).toContain("{focus_lag = 0.1, position_locked = true}")
  })

  it("renames property, element, in, and delete access", () => {
    const lua = transpile(`
      declare const params: HttpRequestParams
      declare const maybe: HttpRequestParams | undefined
      params.maxBodyLength = 1
      params.maxBodyLength += 1
      const agent = params["userAgent"]
      const hasPragma = "pragmaNoCache" in params
      const extended = maybe?.extendedError
      delete params.verboseThrottle
    `)

    expect(lua).toContain("params.max_body_length = 1")
    expect(lua).toContain("params.max_body_length = params.max_body_length + 1")
    expect(lua).toContain("local agent = params.user_agent")
    expect(lua).toContain("local hasPragma = params.pragma_no_cache ~= nil")
    expect(lua).toContain("maybe.extended_error")
    expect(lua).toContain('__TS__Delete(params, "verbose_throttle")')
  })

  it("renames keys read by destructuring", () => {
    const lua = transpile(`
      declare const params: HttpRequestParams
      const { maxBodyLength, userAgent: agent = "bot" } = params
      export const { verifyCert } = params
    `)

    expect(lua).toContain("local maxBodyLength = params.max_body_length")
    expect(lua).toContain("local agent = params.user_agent")
    expect(lua).toContain("____exports.verifyCert = params.verify_cert")
  })

  it("leaves destructuring inside nested functions to its own statement", () => {
    const lua = transpile(`
      declare const params: HttpRequestParams
      const settings = { maxBodyLength: 1 }
      const { maxBodyLength } = params,
        read = () => {
          const { maxBodyLength } = settings

          return maxBodyLength
        }
    `)

    expect(lua).toContain("local maxBodyLength = params.max_body_length")
    expect(lua).toContain("local maxBodyLength = settings.maxBodyLength")
  })

  it("leaves the same names on other objects alone", () => {
    const lua = transpile(`
      const settings = { maxBodyLength: 1 }
      const limit = settings.maxBodyLength
      const { maxBodyLength } = settings
    `)

    expect(lua).toContain("local settings = {maxBodyLength = 1}")
    expect(lua).toContain("local limit = settings.maxBodyLength")
    expect(lua).toContain("local maxBodyLength = settings.maxBodyLength")
  })

  it("still accepts the flat list form", () => {
    const lua = transpile(`ll.HTTPRequest("https://example.com", [HTTP_METHOD, "POST"], "")`)

    expect(lua).toContain('{HTTP_METHOD, "POST"}')
  })
})

describe("ruleset dict key diagnostics", () => {
  it("reports nothing for statically renamed usage", () => {
    expect(
      diagnosticsFor(`
        declare const params: HttpRequestParams
        const copy: HttpRequestParams = { ...params, maxBodyLength: 1 }
        const { userAgent } = copy
        ll.HTTPRequest("https://example.com", copy, "")
        const limit = params["maxBodyLength"]
      `),
    ).toEqual([])
  })

  it("reports dynamic keys", () => {
    expect(
      diagnosticsFor(`
        declare const params: HttpRequestParams
        declare const key: keyof HttpRequestParams
        const value = params[key]
        const has = key in params
      `),
    ).toEqual([
      { code: RULESET_DIAGNOSTIC_CODES.dynamicAccess, text: "key" },
      { code: RULESET_DIAGNOSTIC_CODES.dynamicAccess, text: "key" },
    ])
  })

  it("reports destructuring that is not renamed", () => {
    expect(
      diagnosticsFor(`
        declare const params: HttpRequestParams
        let limit: number | undefined
        const { method, ...rest } = params
        function read({ userAgent }: HttpRequestParams) {}
        ;({ maxBodyLength: limit } = params)
      `),
    ).toEqual([
      { code: RULESET_DIAGNOSTIC_CODES.unsupportedDestructuring, text: "...rest" },
      { code: RULESET_DIAGNOSTIC_CODES.unsupportedDestructuring, text: "{ userAgent }" },
      { code: RULESET_DIAGNOSTIC_CODES.unsupportedDestructuring, text: "{ maxBodyLength: limit }" },
    ])
  })

  it("reports objects whose keys are not declared on a ruleset dict", () => {
    expect(
      diagnosticsFor(`
        const settings = { maxBodyLength: 1 }
        ll.HTTPRequest("https://example.com", settings, "")
      `),
    ).toEqual([{ code: RULESET_DIAGNOSTIC_CODES.undeclaredKeys, text: "settings" }])
  })

  it("warns on Object.keys and Object.entries", () => {
    const diagnostics = checkRulesetKeys(
      createFullProgram(`
        declare const params: HttpRequestParams
        Object.keys(params)
      `),
    )

    expect(diagnostics.map((diagnostic) => [diagnostic.code, diagnostic.category])).toEqual([
      [RULESET_DIAGNOSTIC_CODES.objectKeys, ts.DiagnosticCategory.Warning],
    ])
  })

  it("reports keys that are ruleset keys on only some union members", () => {
    expect(
      diagnosticsFor(`
        declare const value: HttpRequestParams | { maxBodyLength: number }
        const limit = value.maxBodyLength
        declare const params: HttpRequestParams
        const { maxBodyLength, customHeader: { maxBodyLength: header } = {} } = params
      `),
    ).toEqual([
      { code: RULESET_DIAGNOSTIC_CODES.ambiguousKey, text: "maxBodyLength" },
      {
        code: RULESET_DIAGNOSTIC_CODES.ambiguousKey,
        text: "const { maxBodyLength, customHeader: { maxBodyLength: header } = {} } = params",
      },
    ])
  })
})
