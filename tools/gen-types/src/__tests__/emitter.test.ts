import { describe, it, expect } from "bun:test"
import { readFileSync } from "fs"
import { resolve } from "path"
import {
  emitBaseClass,
  emitTypeAlias,
  emitClassDef,
  emitGlobalFunction,
  emitModule,
  emitGlobalVariable,
  emitAll,
} from "../emitter.js"
import type { ConstructorInfo } from "../emitter.js"
import { parseSluaDefinitions, parseLslDefinitions } from "../parser.js"
import type {
  BaseClass,
  TypeAlias,
  ClassDef,
  FunctionDef,
  ModuleDef,
  GlobalVariable,
} from "../types.js"

const REFS_DIR = resolve(import.meta.dir, "../../../../refs/lsl-definitions")

// ---------------------------------------------------------------------------
// Unit tests for individual emitter functions
// ---------------------------------------------------------------------------

describe("emitBaseClass", () => {
  it("produces declare interface with readonly properties", () => {
    const bc: BaseClass = {
      name: "vector",
      comment: "A 3D vector.",
      methods: [],
      properties: [
        { name: "x", type: "number" },
        { name: "y", type: "number" },
        { name: "z", type: "number" },
      ],
    }
    const result = emitBaseClass(bc)

    expect(result).toMatchSnapshot()
  })

  it("produces method-style operator overloads on the interface", () => {
    const bc: BaseClass = {
      name: "vector",
      comment: "A 3D vector.",
      methods: [
        {
          name: "__add",
          parameters: [{ name: "self" }, { name: "other", type: "vector" }],
          returnType: "vector",
        },
        {
          name: "__unm",
          parameters: [{ name: "self" }],
          returnType: "vector",
        },
      ],
      properties: [{ name: "x", type: "number" }],
    }

    const result = emitBaseClass(bc)

    // Method-style operators live on the interface, no companion namespace
    expect(result).not.toContain("declare namespace vector {")

    expect(result).toMatchSnapshot()
  })

  it("emits intersected overloads for union operator types", () => {
    const bc: BaseClass = {
      name: "vector",
      methods: [
        {
          name: "__mul",
          parameters: [{ name: "self" }, { name: "other", type: "number | vector | quaternion" }],
          returnType: "vector",
        },
      ],
      properties: [],
    }

    const result = emitBaseClass(bc)

    // Should be intersected with &
    expect(result).not.toContain("declare namespace vector {")

    expect(result).toMatchSnapshot()
  })

  it("does not emit __tostring as an operator", () => {
    const bc: BaseClass = {
      name: "uuid",
      methods: [
        {
          name: "__tostring",
          parameters: [{ name: "self" }],
          returnType: "string",
        },
      ],
      properties: [],
    }

    const result = emitBaseClass(bc)

    expect(result).not.toContain("__tostring")

    // No namespace needed if there are no operators
    expect(result).not.toContain("declare namespace uuid")

    expect(result).toMatchSnapshot()
  })

  it("does not emit __eq as an operator (not in TSTL)", () => {
    const bc: BaseClass = {
      name: "quaternion",
      methods: [
        {
          name: "__eq",
          parameters: [{ name: "self" }, { name: "other", type: "quaternion" }],
          returnType: "boolean",
        },
      ],
      properties: [],
    }

    const result = emitBaseClass(bc)

    expect(result).not.toContain("LuaEquals")
    expect(result).not.toContain("__eq")

    expect(result).toMatchSnapshot()
  })

  it("emits declare class with @customConstructor when ctor is provided", () => {
    const bc: BaseClass = {
      name: "vector",
      comment: "A 3D vector.",
      methods: [
        {
          name: "__add",
          parameters: [{ name: "self" }, { name: "other", type: "vector" }],
          returnType: "vector",
        },
      ],
      properties: [
        { name: "x", type: "number" },
        { name: "y", type: "number" },
        { name: "z", type: "number" },
      ],
    }

    const ctor: ConstructorInfo = {
      className: "Vector",
      customConstructor: "vector.create",
      params: [
        { name: "x", type: "number" },
        { name: "y", type: "number" },
        { name: "z", type: "number?" },
      ],
    }

    const result = emitBaseClass(bc, ctor)

    // Should NOT emit interface
    expect(result).not.toContain("declare interface vector {")

    expect(result).toMatchSnapshot()
  })
})

describe("emitTypeAlias", () => {
  it("produces declare type alias", () => {
    const alias: TypeAlias = {
      name: "rotation",
      definition: "quaternion",
      comment: "'rotation' is an alias for 'quaternion'",
    }

    const result = emitTypeAlias(alias)

    expect(result).toMatchSnapshot()
  })

  it("maps complex definitions through mapType", () => {
    const alias: TypeAlias = {
      name: "list",
      definition: "{string | number | vector | uuid | quaternion | boolean}",
    }

    const result = emitTypeAlias(alias)

    // The mapType should convert {A | B | ...} to (A | B | ...)[]
    expect(result).toContain("[]")

    expect(result).toMatchSnapshot()
  })
})

describe("emitClassDef", () => {
  it("produces declare interface with methods (self skipped)", () => {
    const cls: ClassDef = {
      name: "LLEvents",
      comment: "Event registration class.",
      methods: [
        {
          name: "on",
          comment: "Registers a callback.",
          parameters: [
            { name: "self" },
            { name: "event", type: "LLEventName" },
            { name: "callback", type: "LLEventHandler" },
          ],
          returnType: "LLEventHandler",
        },
      ],
      properties: [],
    }

    const result = emitClassDef(cls)

    // "self" from YAML should not appear -- replaced by TypeScript "this" param
    expect(result).not.toMatch(/on\(self,/)

    expect(result).toMatchSnapshot()
  })
})

describe("emitGlobalVariable", () => {
  it("produces declare const for a normal variable", () => {
    const gv: GlobalVariable = {
      name: "LLEvents",
      type: "LLEvents",
      comment: "Event singleton.",
    }

    const result = emitGlobalVariable(gv)

    expect(result).toMatchSnapshot()
  })

  it("skips slua-removed variables", () => {
    const gv: GlobalVariable = {
      name: "loadstring",
      type: "nil",
      "slua-removed": true,
    }

    const result = emitGlobalVariable(gv)

    expect(result).toBe("")
  })
})

describe("emitGlobalFunction", () => {
  it("produces declare function with parameters and return type", () => {
    const fn: FunctionDef = {
      name: "touuid",
      comment: "Creates a new uuid from a string.",
      parameters: [{ name: "val", type: "string? | buffer | uuid" }],
      returnType: "uuid?",
    }

    const result = emitGlobalFunction(fn)

    expect(result).toMatchSnapshot()
  })

  it("emits type parameters", () => {
    const fn: FunctionDef = {
      name: "assert",
      parameters: [
        { name: "value", type: "T?" },
        { name: "message", type: "string?" },
      ],
      returnType: "T",
      typeParameters: ["T"],
    }

    const result = emitGlobalFunction(fn)

    expect(result).toMatchSnapshot()
  })
})

describe("emitModule", () => {
  it("produces declare namespace with functions and constants", () => {
    const mod: ModuleDef = {
      name: "vector",
      comment: "Vector manipulation library.",
      functions: [
        {
          name: "create",
          comment: "Creates a new vector.",
          parameters: [
            { name: "x", type: "number" },
            { name: "y", type: "number" },
            { name: "z", type: "number?" },
          ],
          returnType: "vector",
        },
        {
          name: "magnitude",
          parameters: [{ name: "v", type: "vector" }],
          returnType: "number",
        },
      ],
      constants: [
        {
          name: "zero",
          type: "vector",
          comment: "Zero vector.",
        },
      ],
    }

    const result = emitModule(mod)

    expect(result).toMatchSnapshot()
  })

  it("emits callable interface for callable modules", () => {
    const mod: ModuleDef = {
      name: "vector",
      callable: {
        name: "vector",
        comment: "Creates a new vector.",
        parameters: [
          { name: "x", type: "number" },
          { name: "y", type: "number" },
          { name: "z", type: "number?" },
        ],
        returnType: "vector",
      },
      functions: [
        {
          name: "create",
          parameters: [
            { name: "x", type: "number" },
            { name: "y", type: "number" },
            { name: "z", type: "number?" },
          ],
          returnType: "vector",
        },
      ],
    }

    const result = emitModule(mod)

    expect(result).toMatchSnapshot()
  })

  it("uses PascalCase namespace name when className is provided", () => {
    const mod: ModuleDef = {
      name: "vector",
      functions: [
        {
          name: "create",
          parameters: [
            { name: "x", type: "number" },
            { name: "y", type: "number" },
          ],
          returnType: "vector",
        },
      ],
      constants: [{ name: "zero", type: "vector" }],
    }

    const result = emitModule(mod, "Vector")

    expect(result).not.toContain("declare namespace vector {")

    expect(result).toMatchSnapshot()
  })

  it("skips callable interface when className is provided", () => {
    const mod: ModuleDef = {
      name: "vector",
      callable: {
        name: "vector",
        parameters: [{ name: "x", type: "number" }],
        returnType: "vector",
      },
      functions: [],
    }

    const result = emitModule(mod, "Vector")

    expect(result).not.toContain("declare interface")

    expect(result).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// End-to-end test with real YAML
// ---------------------------------------------------------------------------

describe("emitAll (end-to-end)", () => {
  const sluaYaml = readFileSync(resolve(REFS_DIR, "slua_definitions.yaml"), "utf-8")

  const lslYaml = readFileSync(resolve(REFS_DIR, "lsl_definitions.yaml"), "utf-8")

  const slua = parseSluaDefinitions(sluaYaml)
  const lsl = parseLslDefinitions(lslYaml)

  const output = emitAll(slua, lsl)

  it("contains the auto-generated header", () => {
    expect(output).toContain("// Auto-generated from")
    expect(output).toContain('/// <reference types="@typescript-to-lua/language-extensions" />')
  })

  it("contains base type classes with constructors", () => {
    expect(output).toContain("declare class Vector {")
    expect(output).toContain("declare class Quaternion {")
    expect(output).toContain("declare class UUID {")
    expect(output).toContain("declare type vector = Vector;")
    expect(output).toContain("declare type quaternion = Quaternion;")
    expect(output).toContain("declare type uuid = UUID;")
    // DetectedEvent has no constructor, remains an interface
    expect(output).toContain("declare interface DetectedEvent {")
  })

  it("contains @customConstructor annotations", () => {
    expect(output).toContain("@customConstructor vector.create")
    expect(output).toContain("@customConstructor quaternion.create")
    expect(output).toContain("@customConstructor uuid.create")
  })

  it("contains vector operator overloads (method-style)", () => {
    expect(output).toContain("LuaAdditionMethod<vector, vector>")
    expect(output).toContain("LuaNegationMethod<vector>")
    expect(output).toContain("LuaMultiplicationMethod<number, vector>")
  })

  it("contains type aliases", () => {
    expect(output).toContain("declare type rotation = quaternion;")
    expect(output).toContain("declare type list = ")
  })

  it("contains LLEventMap interface with typed event callbacks", () => {
    expect(output).toContain("declare interface LLEventMap {")
    // Detected events use DetectedEvent[] callback
    expect(output).toContain("collision: (detected: DetectedEvent[]) => void")
    expect(output).toContain("touch_start: (detected: DetectedEvent[]) => void")
    // Non-detected events have typed params
    expect(output).toContain("listen: (Channel: number, Name: string, ID: uuid, Text: string) => void")
    expect(output).toContain("timer: () => void")
    expect(output).toContain("email: (Time: string, Address: string, Subject: string, Body: string, NumberRemaining: number) => void")
    // slua-type overrides are respected
    expect(output).toContain("game_control: (id: uuid, buttons: number, axes: number[]) => void")
    expect(output).toContain("link_message: (SendersLink: number, Value: number, Text: string, ID: string) => void")
    // Removed events should NOT appear
    expect(output).not.toMatch(/state_entry:/)
    expect(output).not.toMatch(/state_exit:/)
  })

  it("defines LLEventName as keyof LLEventMap", () => {
    expect(output).toContain("declare type LLEventName = keyof LLEventMap;")
  })

  it("contains class interfaces with generic LLEvents methods", () => {
    expect(output).toContain("declare interface LLEvents {")
    expect(output).toContain("declare interface LLTimers {")
    // LLEvents methods use generics instead of overloads
    expect(output).toContain("on<E extends keyof LLEventMap>(this: LLEvents, event: E, callback: LLEventMap[E]): LLEventMap[E]")
    expect(output).toContain("off<E extends keyof LLEventMap>(this: LLEvents, event: E, callback: LLEventMap[E]): boolean")
    expect(output).toContain("listeners<E extends keyof LLEventMap>(this: LLEvents, event: E): LLEventMap[E][]")
    expect(output).toContain("eventNames(this: LLEvents): (keyof LLEventMap)[]")
  })

  it("contains global variables (non-removed)", () => {
    expect(output).toContain("declare const LLEvents: LLEvents;")
    expect(output).toContain("declare const LLTimers: LLTimers;")
    // Removed ones should NOT appear as global vars
    expect(output).not.toMatch(/declare const loadstring/)
  })

  it("contains global functions", () => {
    expect(output).toContain("declare function touuid(")
    expect(output).toContain("declare function tovector(")
    expect(output).toContain("declare function toquaternion(")
  })

  it("contains builtin functions", () => {
    expect(output).toContain("declare function print(")
    expect(output).toContain("declare function assert")
    expect(output).toContain("declare function tostring(")
    expect(output).toContain("declare function tonumber(")
  })

  it("contains modules (not ll or llcompat)", () => {
    expect(output).toContain("declare namespace math {")
    expect(output).toContain("declare namespace string {")
    expect(output).toContain("declare namespace table {")
    expect(output).toContain("declare namespace bit32 {")
    // PascalCase namespaces merge with their constructor classes
    expect(output).toContain("declare namespace Vector {")
    expect(output).toContain("declare namespace Quaternion {")
    expect(output).toContain("declare namespace UUID {")
  })

  it("contains the ll namespace with @noSelf", () => {
    expect(output).toContain("/** @noSelf */")
    expect(output).toContain("declare namespace ll {")
  })

  it("contains ll functions with ll prefix stripped", () => {
    // llSay -> Say
    expect(output).toContain("export function Say(")

    // llGetOwner -> GetOwner
    expect(output).toContain("export function GetOwner(")
  })

  it("contains LSL constants", () => {
    expect(output).toContain("declare const AGENT: number;")
    expect(output).toContain("declare const ACTIVE: number;")
  })

  it("does not contain ll or llcompat as standalone modules", () => {
    // ll should only appear as the final namespace, not as a separate module
    // (The "declare namespace ll" comes from LSL functions, not from slua modules)
    const llModuleCount = (output.match(/declare namespace ll \{/g) || []).length

    expect(llModuleCount).toBe(1)
  })
})
