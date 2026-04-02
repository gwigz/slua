/**
 * Emitter -- converts parsed SLua/LSL YAML definitions into TypeScript `.d.ts`
 * declaration strings using the ts-morph builder API.
 */

import { Project, SourceFile, VariableDeclarationKind, ModuleDeclarationKind } from "ts-morph"
import type {
  InterfaceDeclaration,
  ClassDeclaration,
  ModuleDeclaration,
  OptionalKind,
  JSDocStructure,
  JSDocTagStructure,
} from "ts-morph"
import { mapType, mapReturnType, splitTopLevel } from "./type-mapper.js"
import type {
  SLuaDefinitions,
  LSLDefinitions,
  BaseClass,
  ParameterDef,
  TypeAlias,
  ClassDef,
  GlobalVariable,
  FunctionDef,
  ModuleDef,
} from "./types.js"

// ---------------------------------------------------------------------------
// Constructor info for base types that support `new PascalName(...)`
// ---------------------------------------------------------------------------

export interface ConstructorInfo {
  className: string
  customConstructor: string
  params: ParameterDef[]
}

/**
 * Map of base class names to PascalCase class names.
 * Constructor params are looked up from the module's `create` function at emit time.
 */
const CONSTRUCTOR_CLASS_NAMES: Record<string, string> = {
  vector: "Vector",
  quaternion: "Quaternion",
  uuid: "UUID",
}

// ---------------------------------------------------------------------------
// Operator overload mapping (TSTL language extensions)
// ---------------------------------------------------------------------------

const OPERATOR_MAP: Record<
  string,
  { ext: string; methodExt: string; alias: string; kind: "binary" | "unary" }
> = {
  __add: { ext: "LuaAddition", methodExt: "LuaAdditionMethod", alias: "add", kind: "binary" },
  __sub: { ext: "LuaSubtraction", methodExt: "LuaSubtractionMethod", alias: "sub", kind: "binary" },
  __mul: {
    ext: "LuaMultiplication",
    methodExt: "LuaMultiplicationMethod",
    alias: "mul",
    kind: "binary",
  },
  __div: { ext: "LuaDivision", methodExt: "LuaDivisionMethod", alias: "div", kind: "binary" },
  __mod: { ext: "LuaModulo", methodExt: "LuaModuloMethod", alias: "mod", kind: "binary" },
  __unm: { ext: "LuaNegation", methodExt: "LuaNegationMethod", alias: "neg", kind: "unary" },
}

// ---------------------------------------------------------------------------
// Reserved words that cannot be used as identifiers in TypeScript
// ---------------------------------------------------------------------------

const TS_RESERVED_WORDS = new Set([
  "typeof",
  "instanceof",
  "in",
  "delete",
  "void",
  "null",
  "undefined",
  "function",
  "class",
  "enum",
  "extends",
  "super",
  "const",
  "let",
  "var",
  "return",
  "throw",
  "new",
  "this",
  "switch",
  "case",
  "default",
  "break",
  "continue",
  "for",
  "while",
  "do",
  "if",
  "else",
  "try",
  "catch",
  "finally",
  "with",
  "yield",
  "import",
  "export",
  "debugger",
])

// ---------------------------------------------------------------------------
// LSL type -> TS type
// ---------------------------------------------------------------------------

const LSL_TYPE_MAP: Record<string, string> = {
  integer: "number",
  float: "number",
  string: "string",
  void: "void",
  key: "UUID",
  rotation: "Quaternion",
  vector: "Vector",
  list: "list",
}

function mapLslType(lslType: string) {
  return LSL_TYPE_MAP[lslType] ?? lslType
}

/**
 * Map an LSL return type, handling complex slua-return annotations.
 */
function mapLslReturnType(lslType: string) {
  if (lslType in LSL_TYPE_MAP) {
    return LSL_TYPE_MAP[lslType]
  }

  return mapReturnType(lslType)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a PascalCase, UPPER_CASE, or snake_case parameter name to standard
 * JS camelCase.
 *
 * Handles acronyms correctly:
 *   AvatarID   -> avatarId
 *   HTTPMethod -> httpMethod
 *   URL        -> url
 *   Value      -> value
 *   world_pos  -> worldPos
 *   agent_id   -> agentId
 */
function toCamelCase(name: string) {
  // snake_case: split on underscores, lowercase-join with capitalised segments
  if (name.includes("_")) {
    return name
      .split("_")
      .map((seg, i) => {
        if (i === 0) return seg.toLowerCase()

        return seg[0].toUpperCase() + seg.slice(1).toLowerCase()
      })
      .join("")
  }

  // No uppercase at all -> already camelCase / lowercase
  if (!/[A-Z]/.test(name)) {
    return name
  }

  const words = name.match(/[A-Z]{2,}(?=[A-Z][a-z]|$)|[A-Z][a-z]*|[a-z]+|\d+/g)

  if (!words) {
    return name
  }

  return words
    .map((word, i) => {
      if (i === 0) return word.toLowerCase()

      return word[0].toUpperCase() + word.slice(1).toLowerCase()
    })
    .join("")
}

/**
 * Sanitize a parameter name: convert to camelCase and escape reserved words.
 */
function sanitizeParamName(name: string) {
  // "..." is the variadic marker -- keep as-is.
  if (name === "...") {
    return name
  }

  const camel = toCamelCase(name)

  // Replace reserved words used as parameter names
  if (TS_RESERVED_WORDS.has(camel)) {
    return `${camel}_`
  }

  return camel
}

/**
 * Sanitize a constant/variable name, replacing TypeScript reserved words.
 */
function sanitizeConstName(name: string) {
  if (TS_RESERVED_WORDS.has(name)) {
    return `${name}_`
  }
  return name
}

/**
 * Filter and clean type parameters, removing variadic packs.
 */
function cleanTypeParams(typeParams?: string[]) {
  if (!typeParams) {
    return undefined
  }

  const cleaned = typeParams.filter((p) => !p.endsWith("..."))

  return cleaned.length > 0 ? cleaned : undefined
}

// ---------------------------------------------------------------------------
// ts-morph helpers
// ---------------------------------------------------------------------------

/** Shared in-memory Project -- created once, reused across all emit* helpers. */
let _project: Project | null = null
let _sfCounter = 0

function createSourceFile() {
  _project ??= new Project({ useInMemoryFileSystem: true })

  return _project.createSourceFile(`_temp_${_sfCounter++}.d.ts`, "")
}

/**
 * Normalize a tooltip/comment string from YAML for use as a JSDoc description.
 *
 * YAML tooltips use two conventions that need fixing:
 *   1. Real newlines + leading whitespace from YAML multi-line string continuation
 *      (e.g. `"long text\\n\n        more text"`) -- these are formatting artifacts.
 *   2. Literal `\n` sequences (from `\\n` in YAML) that represent intended line breaks.
 *
 * We strip the continuation whitespace first, then convert literal `\n` to real newlines.
 */
function sanitizeComment(text: string) {
  return text
    .replace(/\n\s*/g, "") // strip YAML continuation newlines + their indentation
    .replace(/\\n/g, "\n") // convert literal \n markers to real newlines
    .trim()
}

/**
 * Build a single JSDoc structure, optionally combining a description with
 * a `@deprecated` tag so ts-morph emits one `/** ... *​/` block instead of
 * separate blocks for each piece.
 */
function buildDocs(
  comment: string | undefined,
  deprecated: boolean | { reason?: string; use?: string } | undefined,
): OptionalKind<JSDocStructure>[] {
  const doc: OptionalKind<JSDocStructure> = {}
  let hasContent = false

  if (comment) {
    doc.description = sanitizeComment(comment)
    hasContent = true
  }

  if (deprecated) {
    let text: string | undefined

    if (typeof deprecated === "object") {
      const parts: string[] = []

      if (deprecated.use) {
        parts.push(`Use '${deprecated.use}' instead.`)
      }

      if (deprecated.reason) {
        parts.push(deprecated.reason)
      }

      text = parts.length > 0 ? parts.join(" ") : undefined
    }

    doc.tags = [{ tagName: "deprecated", ...(text ? { text } : {}) }]
    hasContent = true
  }

  return hasContent ? [doc] : []
}

function buildParams(params: ParameterDef[] | undefined, skipSelf: boolean) {
  if (!params || params.length === 0) {
    return []
  }

  const filtered = skipSelf ? params.filter((p) => p.name !== "self") : params

  return filtered.map((p) => {
    const name = sanitizeParamName(p.name)

    if (name === "...") {
      if (p.type && p.type.startsWith("...")) {
        const inner = mapType(p.type.slice(3).trim())

        return { name: "args", isRestParameter: true, type: `${inner}[]` }
      }

      const type = p.type ? mapType(p.type) : "any"

      return { name: "args", isRestParameter: true, type: `${type}[]` }
    }

    const isOptional = p.type?.endsWith("?") ?? false
    const rawType = isOptional ? p.type!.slice(0, -1) : (p.type ?? "any")
    const mappedType = mapType(rawType)

    return isOptional
      ? { name, hasQuestionToken: true, type: mappedType }
      : { name, type: mappedType }
  })
}

function buildOperatorType(
  method: { name: string; parameters: ParameterDef[]; returnType?: string },
  op: (typeof OPERATOR_MAP)[string],
) {
  if (op.kind === "unary") {
    const returnType = mapType(method.returnType ?? "any")

    return `${op.methodExt}<${returnType}>`
  }

  const otherParam = method.parameters.find((p) => p.name !== "self")
  const otherType = otherParam?.type ?? "any"
  const returnType = mapType(method.returnType ?? "any")
  const unionParts = splitTopLevel(otherType, " | ")

  if (unionParts.length > 1) {
    return unionParts
      .map((part) => `${op.methodExt}<${mapType(part.trim())}, ${returnType}>`)
      .join(" & ")
  }

  return `${op.methodExt}<${mapType(otherType)}, ${returnType}>`
}

// ---------------------------------------------------------------------------
// Private add-to-SourceFile helpers (called by both emit* wrappers and emitAll)
// ---------------------------------------------------------------------------

/**
 * Add base class members (properties + operator overloads) to a class or interface declaration.
 */
function addBaseClassMembers(decl: InterfaceDeclaration | ClassDeclaration, bc: BaseClass) {
  for (const prop of bc.properties) {
    decl.addProperty({
      name: prop.name,
      type: mapType(prop.type),
      isReadonly: true,
      ...(prop.comment ? { docs: [{ description: sanitizeComment(prop.comment) }] } : {}),
    })
  }

  for (const method of bc.methods) {
    const op = OPERATOR_MAP[method.name]

    if (op) {
      decl.addProperty({
        name: op.alias,
        type: buildOperatorType(method, op),
        ...(method.comment ? { docs: [{ description: sanitizeComment(method.comment) }] } : {}),
      })
    } else if (!method.name.startsWith("__")) {
      // Skip Lua metamethods not in OPERATOR_MAP (e.g. __eq, __tostring) -- no TS equivalent.
      const params = buildParams(method.parameters, true)

      decl.addMethod({
        name: method.name,
        parameters: params,
        returnType: mapReturnType(method.returnType ?? "void"),
        ...(method.comment ? { docs: [{ description: sanitizeComment(method.comment) }] } : {}),
      })
    }
  }
}

function addBaseClass(sf: SourceFile, bc: BaseClass, ctor?: ConstructorInfo) {
  if (ctor) {
    const cls = sf.addClass({
      name: ctor.className,
      hasDeclareKeyword: true,
      docs: bc.comment
        ? [
            {
              description: `${sanitizeComment(bc.comment)}\n@customConstructor ${ctor.customConstructor}`,
            },
          ]
        : [{ description: `@customConstructor ${ctor.customConstructor}` }],
    })

    cls.addConstructor({ parameters: buildParams(ctor.params, false) })

    addBaseClassMembers(cls, bc)
  } else {
    const comment = buildInterfaceComment(bc.name, bc.comment)

    const iface = sf.addInterface({
      name: bc.name,
      hasDeclareKeyword: true,
      ...(comment ? { docs: [{ description: comment }] } : {}),
    })

    addBaseClassMembers(iface, bc)
  }
}

function addEventMap(sf: SourceFile, lsl: LSLDefinitions) {
  const lslEvents = Object.entries(lsl.events).filter(([, ev]) => !ev["slua-removed"])

  const iface = sf.addInterface({
    name: "LLEventMap",
    hasDeclareKeyword: true,
    docs: [{ description: "@noSelf" }],
  })

  for (const [name, ev] of lslEvents) {
    const docs = buildDocs(ev.tooltip, ev["slua-deprecated"] ?? ev.deprecated)

    if (ev["detected-semantics"]) {
      iface.addProperty({
        name,
        type: "(detected: DetectedEvent[]) => void",
        ...(docs.length > 0 ? { docs } : {}),
      })
    } else {
      const params = (ev.arguments ?? []).map((argObj) => {
        const argName = Object.keys(argObj)[0]
        const argDef = argObj[argName]
        const sluaType = (argDef as any)["slua-type"]
        const useBool = argDef["bool-semantics"] && argDef.type === "integer"
        const tsType = useBool ? "boolean" : sluaType ? mapType(sluaType) : mapLslType(argDef.type)

        return `${sanitizeParamName(argName)}: ${tsType}`
      })

      iface.addProperty({
        name,
        type: `(${params.join(", ")}) => void`,
        ...(docs.length > 0 ? { docs } : {}),
      })
    }
  }
}

/** Classes that use colon-style (self) method calls at runtime */
const SELF_CLASSES = new Set(["LLEvents", "LLTimers", "DetectedEvent"])

/** Build a JSDoc comment, conditionally omitting @noSelf for self-call classes. */
function buildInterfaceComment(name: string, comment: string | undefined): string | undefined {
  const useSelf = SELF_CLASSES.has(name)

  if (comment && useSelf) return sanitizeComment(comment)
  if (comment) return `${sanitizeComment(comment)}\n@noSelf`
  if (useSelf) return undefined

  return "@noSelf"
}

function addClassDef(sf: SourceFile, cls: ClassDef) {
  const comment = buildInterfaceComment(cls.name, cls.comment)

  const iface = sf.addInterface({
    name: cls.name,
    hasDeclareKeyword: true,
    ...(comment ? { docs: [{ description: comment }] } : {}),
  })

  for (const prop of cls.properties ?? []) {
    iface.addProperty({
      name: prop.name,
      type: mapType(prop.type),
      isReadonly: true,
      ...(prop.comment ? { docs: [{ description: sanitizeComment(prop.comment) }] } : {}),
    })
  }

  for (const method of cls.methods ?? []) {
    // Methods that take LLEventName + LLEventHandler become generic over LLEventMap:
    // <E extends keyof LLEventMap>(event: E, callback: LLEventMap[E]): LLEventMap[E]
    const hasEventOverload = method.parameters.some((p) => p.type === "LLEventName")

    if (hasEventOverload) {
      const retIsHandler = method.returnType === "LLEventHandler"
      const retIsHandlerArray = method.returnType === "{LLEventHandler}"

      const remapped = method.parameters.map((p) => ({
        ...p,
        type:
          p.type === "LLEventName" ? "E" : p.type === "LLEventHandler" ? "LLEventMap[E]" : p.type,
      }))

      const retType = retIsHandler
        ? "LLEventMap[E]"
        : retIsHandlerArray
          ? "LLEventMap[E][]"
          : (method.returnType ?? "void")

      iface.addMethod({
        name: method.name,
        typeParameters: ["E extends keyof LLEventMap"],
        parameters: buildParams(remapped, true),
        returnType: mapReturnType(retType),
        ...(method.comment ? { docs: [{ description: sanitizeComment(method.comment) }] } : {}),
      })
    } else {
      const params = buildParams(method.parameters, true)

      // eventNames on LLEvents returns (keyof LLEventMap)[] instead of string[]
      const returnType =
        cls.name === "LLEvents" && method.name === "eventNames"
          ? "(keyof LLEventMap)[]"
          : mapReturnType(method.returnType ?? "void")

      iface.addMethod({
        name: method.name,
        parameters: params,
        returnType,
        ...(method.comment ? { docs: [{ description: sanitizeComment(method.comment) }] } : {}),
      })
    }
  }
}

function addGlobalVariable(sf: SourceFile, gv: GlobalVariable) {
  if (gv["slua-removed"]) {
    return
  }

  const type = gv.type.startsWith("typeof(")
    ? gv.type.replace("typeof(", "typeof ").replace(/\)$/, "")
    : mapType(gv.type)

  sf.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    hasDeclareKeyword: true,
    declarations: [{ name: gv.name, type }],
    ...(gv.comment ? { docs: [{ description: sanitizeComment(gv.comment) }] } : {}),
  })
}

function addGlobalFunction(sf: SourceFile, fn: FunctionDef) {
  if (TS_RESERVED_WORDS.has(fn.name)) {
    return
  }

  const docs = buildDocs(fn.comment, fn.deprecated)

  // Always add @noSelf so TSTL never inserts a spurious `self` argument,
  // regardless of the consumer's `noImplicitSelf` setting.
  if (docs.length > 0) {
    const last = docs[docs.length - 1]
    last.tags = [...(last.tags ?? []), { tagName: "noSelf" }]
  } else {
    docs.push({ tags: [{ tagName: "noSelf" }] })
  }

  sf.addFunction({
    name: fn.name,
    hasDeclareKeyword: true,
    parameters: buildParams(fn.parameters, false),
    returnType: mapReturnType(fn.returnType ?? "void"),
    typeParameters: cleanTypeParams(fn.typeParameters),
    docs,
  })
}

function addModule(sf: SourceFile, mod: ModuleDef, className?: string) {
  const namespaceName = className ?? mod.name

  // If the module is callable and doesn't have a PascalCase class (which
  // already provides a constructor), emit a callable interface.
  if (mod.callable && !className) {
    const callFn = mod.callable

    const iface = sf.addInterface({
      name: mod.name,
      hasDeclareKeyword: true,
      ...(mod.comment ? { docs: [{ description: sanitizeComment(mod.comment) }] } : {}),
    })

    iface.addCallSignature({
      parameters: buildParams(callFn.parameters, false),
      returnType: mapReturnType(callFn.returnType ?? "void"),
    })
  }

  // Build docs: module comment (if not already on callable interface) + @noSelf tag
  const nsDocs: OptionalKind<JSDocStructure>[] = []

  if (mod.comment && !(mod.callable && !className)) {
    nsDocs.push({ description: sanitizeComment(mod.comment) })
  }

  nsDocs.push({ tags: [{ tagName: "noSelf" }] })

  const ns = sf.addModule({
    name: namespaceName,
    hasDeclareKeyword: true,
    declarationKind: ModuleDeclarationKind.Namespace,
    docs: nsDocs,
  })

  addModuleMembers(ns, mod)
}

/**
 * Functions where omitting the last optional parameter changes the return
 * from variadic to scalar (e.g. `byte(s)` -> `number`, `byte(s,i,j)` -> `number[]`).
 * Most variadic functions (match, unpack, etc.) always return multiple values
 * regardless of optional params, so they must NOT get this treatment.
 */
const VARIADIC_OVERLOAD_FUNCTIONS = new Set(["byte", "codepoint"])

/**
 * Generate TypeScript overloads for a variadic-return function whose last
 * optional parameter controls single-vs-multi return semantics.
 * e.g. `byte(s: string, i?: number, j?: number): ...number` becomes:
 *   - `byte(s: string, i?: number): number`
 *   - `byte(s: string, i: number, j: number): number[]`
 */
function addVariadicOverloads(ns: ModuleDeclaration, fn: FunctionDef) {
  const baseType = mapType(fn.returnType!.slice(3).trim())
  const params = fn.parameters ?? []
  const docs = buildDocs(fn.comment, fn.deprecated)
  const typeParameters = cleanTypeParams(fn.typeParameters)

  // Overload 1: drop the last param (range-end) -> returns single value
  ns.addFunction({
    name: fn.name,
    isExported: true,
    parameters: buildParams(params.slice(0, -1), false),
    returnType: baseType,
    typeParameters,
    ...(docs.length > 0 ? { docs } : {}),
  })

  // Overload 2: all params required -> returns array
  const allRequiredParams = params.map((p) => {
    if (p.type?.endsWith("?")) {
      return Object.assign({}, p, { type: p.type.slice(0, -1) })
    }
    return p
  })

  ns.addFunction({
    name: fn.name,
    isExported: true,
    parameters: buildParams(allRequiredParams, false),
    returnType: `${baseType}[]`,
    typeParameters,
  })
}

function addModuleMembers(ns: ModuleDeclaration, mod: ModuleDef) {
  if (mod.functions) {
    for (const fn of mod.functions) {
      if (fn.returnType?.startsWith("...") && VARIADIC_OVERLOAD_FUNCTIONS.has(fn.name)) {
        addVariadicOverloads(ns, fn)
        continue
      }

      const docs = buildDocs(fn.comment, fn.deprecated)

      ns.addFunction({
        name: fn.name,
        isExported: true,
        parameters: buildParams(fn.parameters, false),
        returnType: mapReturnType(fn.returnType ?? "void"),
        typeParameters: cleanTypeParams(fn.typeParameters),
        ...(docs.length > 0 ? { docs } : {}),
      })
    }
  }

  if (mod.constants) {
    for (const c of mod.constants) {
      ns.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [{ name: sanitizeConstName(c.name), type: mapType(c.type) }],
        ...(c.comment ? { docs: [{ description: sanitizeComment(c.comment) }] } : {}),
      })
    }
  }
}

// ---------------------------------------------------------------------------
// Section emitters (exported for unit testing -- thin wrappers around add* helpers)
// ---------------------------------------------------------------------------

/**
 * Emit a base class declaration.
 *
 * When `ctor` is provided, emits a `declare class PascalName` with
 * `@customConstructor` (for TSTL) and a `declare type lowercase = PascalName`
 * alias so existing lowercase type references still work.
 *
 * When `ctor` is omitted, emits a plain `declare interface` (e.g. DetectedEvent).
 */
export function emitBaseClass(bc: BaseClass, ctor?: ConstructorInfo) {
  const sf = createSourceFile()

  addBaseClass(sf, bc, ctor)

  return sf.getFullText()
}

/**
 * Emit a type alias declaration.
 */
export function emitTypeAlias(alias: TypeAlias) {
  const sf = createSourceFile()

  sf.addTypeAlias({
    name: alias.name,
    type: mapType(alias.definition),
    hasDeclareKeyword: true,
    ...(alias.comment ? { docs: [{ description: sanitizeComment(alias.comment) }] } : {}),
  })

  return sf.getFullText()
}

/**
 * Emit a class definition (like LLEvents, LLTimers) as an interface.
 */
export function emitClassDef(cls: ClassDef) {
  const sf = createSourceFile()

  addClassDef(sf, cls)

  return sf.getFullText()
}

/**
 * Emit a global variable declaration.
 */
export function emitGlobalVariable(gv: GlobalVariable) {
  if (gv["slua-removed"]) {
    return ""
  }

  const sf = createSourceFile()

  addGlobalVariable(sf, gv)

  return sf.getFullText()
}

/**
 * Emit a global function declaration.
 *
 * Handles special cases:
 * - Functions with names that are TypeScript reserved words are skipped.
 * - Functions with variadic type parameters are simplified.
 */
export function emitGlobalFunction(fn: FunctionDef) {
  if (TS_RESERVED_WORDS.has(fn.name)) {
    return ""
  }

  const sf = createSourceFile()

  addGlobalFunction(sf, fn)

  return sf.getFullText()
}

/**
 * Emit a module (namespace) declaration.
 *
 * When `className` is provided, the namespace uses the PascalCase name and
 * the callable interface is suppressed (it's replaced by a class constructor).
 */
export function emitModule(mod: ModuleDef, className?: string) {
  const sf = createSourceFile()

  addModule(sf, mod, className)

  return sf.getFullText()
}

// ---------------------------------------------------------------------------
// Main emitter
// ---------------------------------------------------------------------------

/**
 * Emit the complete `.d.ts` file from parsed SLua and LSL definitions.
 */
export function emitAll(slua: SLuaDefinitions, lsl: LSLDefinitions) {
  const sf = createSourceFile()

  // 1. Header
  sf.addStatements([
    "// Auto-generated from slua_definitions.yaml and lsl_definitions.yaml",
    "// Do not edit manually.",
    "",
    '/// <reference types="@typescript-to-lua/language-extensions" />',
  ])

  // 2. Base types -- build constructor info from modules
  const constructorMap: Record<string, ConstructorInfo> = {}

  for (const mod of slua.modules) {
    const className = CONSTRUCTOR_CLASS_NAMES[mod.name]

    if (className && mod.functions) {
      const createFn = mod.functions.find((f) => f.name === "create")

      if (createFn) {
        constructorMap[mod.name] = {
          className,
          customConstructor: `${mod.name}.create`,
          params: createFn.parameters ?? [],
        }
      }
    }
  }

  // Inject detected-semantics LSL functions as methods on DetectedEvent (mirrors the Python generator).
  // The YAML has `methods: []` as a placeholder; we populate it from lsl_definitions.yaml here.
  // Must run before addBaseClass so the interface is emitted with the methods.
  const detectedEventClass = slua.baseClasses.find((c) => c.name === "DetectedEvent")

  if (detectedEventClass && detectedEventClass.methods.length === 0) {
    const detectedFuncs = Object.entries(lsl.functions).filter(
      ([, fn]) => fn["detected-semantics"] && !fn["slua-removed"],
    )

    for (const [lslName, fn] of detectedFuncs) {
      // Strip "ll" prefix; replace "Detected" with "Get"; lowercase first char.
      // e.g. llDetectedKey -> DetectedKey -> GetKey -> getKey
      // e.g. llAdjustDamage -> AdjustDamage -> AdjustDamage -> adjustDamage
      const sluaName = lslName.startsWith("ll") ? lslName.slice(2) : lslName
      const withGet = sluaName.replace("Detected", "Get")
      const methodName = withGet[0].toLowerCase() + withGet.slice(1)
      const rawReturn = fn["slua-return"] ?? fn.return ?? "void"

      // Pre-map to a TS-compatible type so addBaseClassMembers' mapReturnType call is a no-op passthrough.
      const returnType = fn["slua-return"] ? mapReturnType(rawReturn) : mapLslType(rawReturn)

      // Replace the first argument (index/Number) with `self`; keep any remaining args.
      const remainingArgs = (fn.arguments ?? []).slice(1).map((argObj) => {
        const argName = Object.keys(argObj)[0]
        const argDef = argObj[argName] as { type: string }

        return { name: argName, type: mapLslType(argDef.type) }
      })

      detectedEventClass.methods.push({
        name: methodName,
        comment: fn.tooltip,
        parameters: [{ name: "self" }, ...remainingArgs],
        returnType,
      })
    }
  }

  for (const bc of slua.baseClasses) {
    addBaseClass(sf, bc, constructorMap[bc.name])
  }

  // 3. LLEventMap -- typed event callback signatures from LSL events
  addEventMap(sf, lsl)

  // 4. Type aliases -- generate event name unions from LSL events
  const lslEvents = Object.entries(lsl.events).filter(([, ev]) => !ev["slua-removed"])

  const detectedEvents = lslEvents
    .filter(([, ev]) => ev["detected-semantics"])
    .map(([name]) => `"${name}"`)

  const nonDetectedEvents = lslEvents
    .filter(([, ev]) => !ev["detected-semantics"])
    .map(([name]) => `"${name}"`)

  for (const alias of slua.typeAliases) {
    // Override placeholder definitions for event name types
    if (alias.name === "LLDetectedEventName" && detectedEvents.length > 0) {
      sf.addTypeAlias({
        name: "LLDetectedEventName",
        type: detectedEvents.join(" | "),
        hasDeclareKeyword: true,
      })
    } else if (alias.name === "LLNonDetectedEventName" && nonDetectedEvents.length > 0) {
      sf.addTypeAlias({
        name: "LLNonDetectedEventName",
        type: nonDetectedEvents.join(" | "),
        hasDeclareKeyword: true,
      })
    } else if (alias.name === "LLEventName") {
      sf.addTypeAlias({
        name: "LLEventName",
        type: "keyof LLEventMap",
        hasDeclareKeyword: true,
      })
    } else {
      sf.addTypeAlias({
        name: alias.name,
        type: mapType(alias.definition),
        hasDeclareKeyword: true,
        ...(alias.comment ? { docs: [{ description: sanitizeComment(alias.comment) }] } : {}),
      })
    }
  }

  // 5. Classes
  for (const cls of slua.classes) {
    addClassDef(sf, cls)
  }

  // 6. Global variables (skip slua-removed)
  for (const gv of slua.globalVariables) {
    addGlobalVariable(sf, gv)
  }

  // 7+8. Global functions and builtin functions
  for (const fn of [...slua.globalFunctions, ...slua.builtinFunctions]) {
    addGlobalFunction(sf, fn)
  }

  // 9. Modules (skip ll and llcompat -- those come from LSL defs)
  for (const mod of slua.modules.filter((m) => m.name !== "ll" && m.name !== "llcompat")) {
    addModule(sf, mod, CONSTRUCTOR_CLASS_NAMES[mod.name])
  }

  // 10. ll namespace (from LSL functions)
  const llFunctions = Object.entries(lsl.functions).filter(([, fn]) => !fn["slua-removed"])

  if (llFunctions.length > 0) {
    const llNs = sf.addModule({
      name: "ll",
      hasDeclareKeyword: true,
      declarationKind: ModuleDeclarationKind.Namespace,
      docs: [{ tags: [{ tagName: "noSelf" }] }],
    })

    for (const [lslName, fn] of llFunctions) {
      const name = lslName.startsWith("ll") ? lslName.slice(2) : lslName
      const docs = buildDocs(fn.tooltip, fn["slua-deprecated"] ?? fn.deprecated)

      // Collect @indexArg / @indexReturn JSDoc tags from index-semantics flags
      const indexTags: OptionalKind<JSDocTagStructure>[] = []

      const params = (fn.arguments ?? []).map((argObj) => {
        const argName = Object.keys(argObj)[0]
        const argDef = argObj[argName]
        const sluaType = (argDef as any)["slua-type"]
        const useBool = argDef["bool-semantics"] && argDef.type === "integer"
        const tsType = useBool ? "boolean" : sluaType ? mapType(sluaType) : mapLslType(argDef.type)
        const paramName = sanitizeParamName(argName)

        if (argDef["index-semantics"]) {
          indexTags.push({ tagName: "indexArg", text: paramName })
        }

        return { name: paramName, type: tsType }
      })

      const hasIndexReturn = !!fn["index-semantics"]

      if (hasIndexReturn) {
        indexTags.push({ tagName: "indexReturn" })
      }

      // For index-return functions returning integer, widen to number | undefined
      // (nil means not-found in Lua, which maps to undefined in TS)
      // For bool-semantics functions returning integer, use boolean
      // (skip list returns -- "some bool-like entries" doesn't make the list itself boolean)
      const rawReturn = fn["slua-return"] ?? fn.return ?? "void"
      const isIntegerReturn = rawReturn === "integer"
      const hasBoolReturn = !!fn["bool-semantics"] && isIntegerReturn
      const returnType =
        hasIndexReturn && isIntegerReturn
          ? "number | undefined"
          : hasBoolReturn
            ? "boolean"
            : fn["slua-return"]
              ? mapLslReturnType(rawReturn)
              : mapLslType(rawReturn)

      // Merge index tags into docs
      if (indexTags.length > 0) {
        if (docs.length > 0) {
          const last = docs[docs.length - 1]
          last.tags = [...(last.tags ?? []), ...indexTags]
        } else {
          docs.push({ tags: indexTags })
        }
      }

      llNs.addFunction({
        name,
        isExported: true,
        parameters: params,
        returnType,
        ...(docs.length > 0 ? { docs } : {}),
      })
    }
  }

  // 11. Constants (from LSL constants, skip slua-removed)
  const lslConstants = Object.entries(lsl.constants).filter(([, c]) => !c["slua-removed"])

  for (const [name, c] of lslConstants) {
    const docs = buildDocs(c.tooltip, c["slua-deprecated"] ?? c.deprecated)

    sf.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      hasDeclareKeyword: true,
      declarations: [{ name, type: c["slua-type"] ? mapType(c["slua-type"]) : mapLslType(c.type) }],
      ...(docs.length > 0 ? { docs } : {}),
    })
  }

  return sf.getFullText()
}
