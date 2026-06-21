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
  MethodDef,
  ModuleDef,
  TypedListParams,
  TypedListRule,
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
// Disabled functions -- these exist in the YAML definitions but are not
// available at runtime in SLua. They are still emitted in the types (so users
// can see them in autocomplete with a deprecation notice) but all parameters
// are typed as `never` to produce a type error on use.
//
// Format: "module.function" (e.g. "math.randomseed")
// ---------------------------------------------------------------------------

const DISABLED_FUNCTIONS = new Set(["math.randomseed"])

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
// Builder chain configuration
// ---------------------------------------------------------------------------

interface BuilderRootConfig {
  /** Name of the wrapper function (e.g. "$setPrimParams") */
  name: string
  /** LSL function name without the "ll" prefix (e.g. "SetLinkPrimitiveParamsFast") */
  llFunction: string
  /** Parameter declarations for args that come before the list */
  preListArgs: string[]
  /** Parameter declarations for args that come after the list */
  postListArgs?: string[]
  /** When true, also emit an options-object overload for use as an expression */
  optionsArg?: boolean
  /** Default values for params in the options-object overload (propertyName -> default expression) */
  optionsDefaults?: Record<string, string>
  /** Custom return type for options overload (uses generic Opts parameter for the options type) */
  optionsReturnType?: string
}

interface BuilderSetConfig {
  /** Name of the param set in typed-list-params.json */
  setName: string
  /** Prefix to strip from constant names to derive method names */
  prefix: string
  /** Root function configurations */
  roots: BuilderRootConfig[]
  /** Constant that acts as a link-target scoping mechanism (e.g. "PRIM_LINK_TARGET") */
  linkConstant?: string
  /** When true, each arg also accepts "" to clear the override */
  clearable?: boolean
}

const BUILDER_CONFIGS: BuilderSetConfig[] = [
  {
    setName: "PrimParam",
    prefix: "PRIM_",
    roots: [
      {
        name: "$setPrimParams",
        llFunction: "SetLinkPrimitiveParamsFast",
        preListArgs: ["linkNumber: number"],
      },
    ],
    linkConstant: "PRIM_LINK_TARGET",
  },
  {
    setName: "ParticleSystemParam",
    prefix: "PSYS_",
    roots: [
      { name: "$particleSystem", llFunction: "ParticleSystem", preListArgs: [] },
      {
        name: "$linkParticleSystem",
        llFunction: "LinkParticleSystem",
        preListArgs: ["linkNumber: number"],
      },
    ],
  },
  {
    setName: "CameraParam",
    prefix: "CAMERA_",
    roots: [{ name: "$setCameraParams", llFunction: "SetCameraParams", preListArgs: [] }],
  },
  {
    setName: "HttpParam",
    prefix: "HTTP_",
    roots: [
      {
        name: "$httpRequest",
        llFunction: "HTTPRequest",
        preListArgs: ["url: string"],
        postListArgs: ["body: string"],
        optionsArg: true,
        optionsDefaults: { method: '"GET"', body: '""' },
      },
    ],
  },
  {
    setName: "CastRayParam",
    prefix: "RC_",
    roots: [
      {
        name: "$castRay",
        llFunction: "CastRay",
        preListArgs: ["start: Vector", "end: Vector"],
        optionsArg: true,
        optionsReturnType: "CastRayResult<Opts>",
      },
    ],
  },
  {
    setName: "CharacterParam",
    prefix: "CHARACTER_",
    roots: [
      { name: "$createCharacter", llFunction: "CreateCharacter", preListArgs: [] },
      { name: "$updateCharacter", llFunction: "UpdateCharacter", preListArgs: [] },
    ],
  },
  {
    setName: "GltfOverrideParam",
    prefix: "OVERRIDE_GLTF_",
    clearable: true,
    roots: [
      {
        name: "$setGltfOverrides",
        llFunction: "SetLinkGLTFOverrides",
        preListArgs: ["link: number", "face: number"],
      },
    ],
  },
  {
    setName: "RezParam",
    prefix: "REZ_",
    roots: [
      {
        name: "$rezObjectWithParams",
        llFunction: "RezObjectWithParams",
        preListArgs: ["inventoryItem: string"],
      },
    ],
  },
]

// GLTF material prim-params accept "" on each override argument — except the leading
// `face` — to clear/keep that override (SL's documented behaviour). They live inside the
// otherwise non-clearable PrimParam set, so they're flagged per-param rather than per-set
// (unlike the OVERRIDE_GLTF_ builder, whose whole set is `clearable`).
const CLEARABLE_PRIM_PARAMS = new Set([
  "PRIM_GLTF_BASE_COLOR",
  "PRIM_GLTF_EMISSIVE",
  "PRIM_GLTF_NORMAL",
  "PRIM_GLTF_METALLIC_ROUGHNESS",
])

function argAcceptsEmptyString(
  setClearable: boolean | undefined,
  ruleName: string,
  argName: string,
): boolean {
  if (toCamelCase(argName) === "face") return false
  return setClearable === true || CLEARABLE_PRIM_PARAMS.has(ruleName)
}

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

function mapListArgType(lslType: string): string {
  if (lslType === "boolean") return "boolean"
  return mapLslType(lslType)
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

function serializeJSDoc(docs: OptionalKind<JSDocStructure>[]): string {
  const parts: string[] = []
  for (const doc of docs) {
    if (doc.description) {
      for (const line of (doc.description as string).split("\n")) {
        parts.push(` * ${line}`)
      }
    }
    if (doc.tags) {
      for (const tag of doc.tags as OptionalKind<JSDocTagStructure>[]) {
        parts.push(` * @${tag.tagName}${tag.text ? ` ${tag.text}` : ""}`)
      }
    }
  }
  return parts.length > 0 ? `\n/**\n${parts.join("\n")}\n */\n` : ""
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

      if (p.type && /^[A-Z]\w*\.\.\.$/.test(p.type.trim())) {
        return { name: "args", isRestParameter: true, type: "any[]" }
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

/**
 * Expand a function's upstream `overloads` into ordered TypeScript signatures.
 * Alternate overloads come first (most specific) so TypeScript resolves them
 * before the general main signature, which is emitted last. Functions without
 * overloads yield a single signature.
 */
function functionSignatures(fn: FunctionDef) {
  const build = (def: FunctionDef | MethodDef) => ({
    parameters: buildParams(def.parameters, false),
    returnType: mapReturnType(def.returnType ?? "void"),
    typeParameters: cleanTypeParams(def.typeParameters),
    docs: buildDocs(def.comment ?? fn.comment, def.deprecated ?? fn.deprecated),
  })

  return [...(fn.overloads ?? []).map(build), build(fn)]
}

/**
 * Append the @noSelf tag so TSTL never inserts a spurious `self` argument,
 * regardless of the consumer's `noImplicitSelf` setting.
 */
function withNoSelf(docs: ReturnType<typeof buildDocs>) {
  if (docs.length > 0) {
    const last = docs[docs.length - 1]
    last.tags = [...(last.tags ?? []), { tagName: "noSelf" }]
  } else {
    docs.push({ tags: [{ tagName: "noSelf" }] })
  }

  return docs
}

function addGlobalFunction(sf: SourceFile, fn: FunctionDef) {
  if (TS_RESERVED_WORDS.has(fn.name)) {
    return
  }

  for (const sig of functionSignatures(fn)) {
    sf.addFunction({
      name: fn.name,
      hasDeclareKeyword: true,
      parameters: sig.parameters,
      returnType: sig.returnType,
      typeParameters: sig.typeParameters,
      docs: withNoSelf(sig.docs),
    })
  }
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

      if (DISABLED_FUNCTIONS.has(`${mod.name}.${fn.name}`)) {
        const docs = buildDocs(fn.comment, fn.deprecated)

        ns.addFunction({
          name: fn.name,
          isExported: true,
          parameters: [{ name: "args", isRestParameter: true, type: "never[]" }],
          returnType: mapReturnType(fn.returnType ?? "void"),
          typeParameters: cleanTypeParams(fn.typeParameters),
          ...(docs.length > 0 ? { docs } : {}),
        })
        continue
      }

      for (const sig of functionSignatures(fn)) {
        ns.addFunction({
          name: fn.name,
          isExported: true,
          parameters: sig.parameters,
          returnType: sig.returnType,
          typeParameters: sig.typeParameters,
          ...(sig.docs.length > 0 ? { docs: sig.docs } : {}),
        })
      }
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
export function emitAll(
  slua: SLuaDefinitions,
  lsl: LSLDefinitions,
  typedListParams?: TypedListParams,
) {
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

  // Return type overrides for functions where the YAML can't express the type
  const returnOverrides: Record<string, string> = {
    llGetExperienceDetails: "ExperienceDetails",
    llDetectedDamage: "DamageDetails",
    llGetPhysicsMaterial: "PhysicsMaterial",
    llGetParcelPrimOwners: "ParcelPrimOwners",
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
      const returnType =
        returnOverrides[lslName] ??
        (fn["slua-return"] ? mapReturnType(rawReturn) : mapLslType(rawReturn))

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

  // Build literal constants map and typed function lookup from param sets
  const literalConstants = new Map<string, number>()
  const typedFunctionMap = new Map<
    string,
    { name: string; flagsOnly: boolean; hasReturns: boolean }
  >()
  const setFlagsOnly = new Map<string, boolean>()
  // Scraped wiki descriptions, keyed by constant name. First write wins so the
  // richer setter prose ("Sets the prim's name.") beats a later getter set's
  // cross-reference description for the same constant.
  const constantComments = new Map<string, string>()
  const addConstantComment = (name: string, comment: string | undefined) => {
    if (comment && !constantComments.has(name)) {
      constantComments.set(name, comment)
    }
  }
  if (typedListParams) {
    for (const set of typedListParams.sets) {
      const flagsOnly = set.params.every((r) => r.args.length === 0) && !set.subDispatch
      const hasReturns = set.params.some((r) => r.returns && r.returns.length > 0)
      setFlagsOnly.set(set.name, flagsOnly)
      for (const rule of set.params) {
        literalConstants.set(rule.name, rule.value)
        addConstantComment(rule.name, rule.comment)
      }
      if (set.subDispatch) {
        for (const rule of set.subDispatch.params) {
          literalConstants.set(rule.name, rule.value)
          addConstantComment(rule.name, rule.comment)
        }
        const dispatchConst = lsl.constants[set.subDispatch.constant]
        if (dispatchConst) {
          literalConstants.set(set.subDispatch.constant, parseInt(dispatchConst.value, 10))
        }
      }
      for (const fn of set.functions) {
        typedFunctionMap.set(fn, { name: set.name, flagsOnly, hasReturns })
      }
    }
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
        returnOverrides[lslName] ??
        (hasIndexReturn && isIntegerReturn
          ? "number | undefined"
          : hasBoolReturn
            ? "boolean"
            : fn["slua-return"]
              ? mapLslReturnType(rawReturn)
              : mapLslType(rawReturn))

      // Merge index tags into docs
      if (indexTags.length > 0) {
        if (docs.length > 0) {
          const last = docs[docs.length - 1]
          last.tags = [...(last.tags ?? []), ...indexTags]
        } else {
          docs.push({ tags: indexTags })
        }
      }

      const typedSet = typedFunctionMap.get(lslName)
      if (typedSet && typedSet.flagsOnly) {
        const flagType = `${typedSet.name}Flag`
        if (typedSet.hasReturns) {
          const mapperType = `Map${typedSet.name}`
          const typedParams = params.map((p) => {
            if (p.type === "list" || p.type === "number[]") {
              return `${p.name}: T`
            }
            return `${p.name}: ${p.type}`
          })

          const jsdoc = serializeJSDoc(docs)
          const sig = `${jsdoc}export function ${name}<const T extends readonly ${flagType}[]>(${typedParams.join(", ")}): ${mapperType}<T> | [];\n`
          llNs.insertText(llNs.getEnd() - 1, sig)
        } else {
          // Flags-only without return info: keep old behavior
          const simpleParams = params.map((p) =>
            p.type === "list" || p.type === "number[]" ? { ...p, type: `${flagType}[]` } : p,
          )
          llNs.addFunction({
            name,
            isExported: true,
            parameters: simpleParams,
            returnType,
            ...(docs.length > 0 ? { docs } : {}),
          })
        }
      } else if (typedSet) {
        // Emit typed generic signature via raw text (ts-morph doesn't support `const T`)
        const parseType = `Parse${typedSet.name}s`
        const typedParams = params.map((p) => {
          if (p.type === "list" || p.type === "number[]") {
            return `${p.name}: T & ${parseType}<T>`
          }
          return `${p.name}: ${p.type}`
        })

        const jsdoc = serializeJSDoc(docs)

        const mappedReturn = typedSet.hasReturns ? `Map${typedSet.name}<T> | []` : returnType
        const sig = `${jsdoc}export function ${name}<const T extends readonly unknown[]>(${typedParams.join(", ")}): ${mappedReturn};\n`
        llNs.insertText(llNs.getEnd() - 1, sig)
      } else {
        llNs.addFunction({
          name,
          isExported: true,
          parameters: params,
          returnType,
          ...(docs.length > 0 ? { docs } : {}),
        })
      }
    }
  }

  // 11. Constants (from LSL constants, skip slua-removed)
  const lslConstants = Object.entries(lsl.constants).filter(([, c]) => !c["slua-removed"])

  for (const [name, c] of lslConstants) {
    // Prefer the scraped wiki description over the YAML tooltip, which for
    // typed-list constants is just the usage string (or empty).
    const comment = constantComments.get(name) ?? c.tooltip
    const docs = buildDocs(comment, c["slua-deprecated"] ?? c.deprecated)
    const literalValue = literalConstants.get(name)

    // Determine the type annotation: prefer typed-list-params literal, then
    // parse the YAML value for integer constants, then slua-type, then LSL type.
    let constType: string
    if (literalValue !== undefined) {
      constType = String(literalValue)
    } else if (c.type === "integer" && c.value != null) {
      const v = String(c.value)
      constType = String(parseInt(v, v.startsWith("0x") ? 16 : 10))
    } else if (c["slua-type"]) {
      constType = mapType(c["slua-type"])
    } else {
      constType = mapLslType(c.type)
    }

    sf.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      hasDeclareKeyword: true,
      declarations: [{ name, type: constType }],
      ...(docs.length > 0 ? { docs } : {}),
    })
  }

  // Fixed-tuple return types for functions that always return the same shape
  sf.insertText(
    sf.getFullText().length,
    [
      "",
      "/** Return type for ll.GetExperienceDetails — always 6 elements. */",
      "type ExperienceDetails = [name: string, ownerId: UUID, experienceId: UUID, state: number, stateMessage: string, groupId: UUID]",
      "",
      "/** Return type for ll.DetectedDamage — always 3 elements. */",
      "type DamageDetails = [damage: number, damageType: number, originalDamage: number]",
      "",
      "/** Return type for ll.GetPhysicsMaterial — always 4 elements. */",
      "type PhysicsMaterial = [gravityMultiplier: number, restitution: number, friction: number, density: number]",
      "",
      "/** Repeating [agent, landImpact] pairs from ll.GetParcelPrimOwners. */",
      "type ParcelPrimOwners = [...ParcelPrimOwnerStride, ...ParcelPrimOwners] | []",
      "type ParcelPrimOwnerStride = [agent: UUID, landImpact: number]",
      "",
      "/** Hit stride with no data flags. */",
      "type CastRayHit = [uuid: UUID, pos: Vector]",
      "/** Hit stride with RC_GET_NORMAL. */",
      "type CastRayHitNormal = [uuid: UUID, pos: Vector, normal: Vector]",
      "/** Hit stride with RC_GET_LINK_NUM. */",
      "type CastRayHitLink = [uuid: UUID, pos: Vector, link: number]",
      "/** Hit stride with RC_GET_NORMAL | RC_GET_LINK_NUM. */",
      "type CastRayHitBoth = [uuid: UUID, pos: Vector, normal: Vector, link: number]",
      "",
      "/** Repeating hit strides followed by a status code. */",
      "type CastRayHits<Hit extends unknown[]> = [...Hit, ...CastRayHits<Hit>] | [status: number] | []",
      "",
      "/** Maps RC_DATA_FLAGS value to the corresponding result type. */",
      "type CastRayResult<Opts extends CastRayParamOptions> =",
      "  Opts extends { dataFlags: 5 | 7 } ? CastRayHits<CastRayHitBoth> :",
      "  Opts extends { dataFlags: 4 | 6 } ? CastRayHits<CastRayHitLink> :",
      "  Opts extends { dataFlags: 1 | 3 } ? CastRayHits<CastRayHitNormal> :",
      "  CastRayHits<CastRayHit>",
    ].join("\n"),
  )

  // Emit typed list param maps and parser types for each param set
  if (typedListParams) {
    const lines: string[] = [
      "",
      "/** Branded error type that surfaces a human-readable message in diagnostics. */",
      "type TypedListError<Msg extends string> = { [K in `__error: ${Msg}`]: never }",
    ]

    const emitParamMap = (
      mapName: string,
      comment: string,
      rules: TypedListRule[],
      clearable?: boolean,
    ) => {
      lines.push("")
      lines.push(`/** ${comment} */`)
      lines.push(`interface ${mapName} {`)
      for (const rule of rules) {
        const namedArgs = rule.args
          .map((a) => {
            const t = mapListArgType(a.type)
            const clear = argAcceptsEmptyString(clearable, rule.name, a.name)
            return `${toCamelCase(a.name)}: ${clear ? `${t} | ""` : t}`
          })
          .join(", ")
        lines.push(`  [${rule.name}]: [${namedArgs}]`)
      }
      lines.push("}")
    }

    const emitNameMap = (nameMapName: string, rules: TypedListRule[]) => {
      lines.push("")
      lines.push(`/** Reverse map from numeric value to constant name for error messages. */`)
      lines.push(`interface ${nameMapName} {`)
      for (const rule of rules) {
        lines.push(`  ${rule.value}: "${rule.name}"`)
      }
      lines.push("}")
    }

    for (const set of typedListParams.sets) {
      if (setFlagsOnly.get(set.name)) {
        const flagType = `${set.name}Flag`
        const hasReturns = set.params.some((r) => r.returns && r.returns.length > 0)

        lines.push("")
        lines.push(`/** Valid constants for ${set.name} functions. */`)
        lines.push(`type ${flagType} = ${set.params.map((r) => `typeof ${r.name}`).join(" | ")}`)

        if (hasReturns) {
          const returnMapName = `${set.name}ReturnMap`
          lines.push("")
          lines.push(`/** Maps each ${set.name} constant to the tuple of values it returns. */`)
          lines.push(`interface ${returnMapName} {`)
          for (const rule of set.params) {
            if (!rule.returns?.length) {
              throw new Error(`${set.name} has hasReturns but ${rule.name} is missing returns`)
            }
            const returns = rule.returns
            const namedReturns = returns
              .map((a) => `${toCamelCase(a.name)}: ${mapListArgType(a.type)} | undefined`)
              .join(", ")
            lines.push(`  [${rule.name}]: [${namedReturns}]`)
          }
          lines.push("}")

          const mapName = `Map${set.name}`
          lines.push("")
          lines.push(`/** Recursively maps a tuple of ${set.name} flags to their return types. */`)
          lines.push(`type ${mapName}<T extends readonly ${flagType}[]> =`)
          lines.push("  T extends readonly [] ? [] :")
          lines.push("  T extends readonly [infer K, ...infer Rest]")
          lines.push(`    ? K extends keyof ${returnMapName}`)
          lines.push(`      ? Rest extends readonly ${flagType}[]`)
          lines.push(`        ? [...${returnMapName}[K], ...${mapName}<Rest>]`)
          lines.push("        : never")
          lines.push("      : never")
          lines.push(`    : (${returnMapName}[${flagType}])[number][]`)
        }

        continue
      }

      const mapName = `${set.name}Map`
      const nameMapName = `${set.name}NameMap`
      const parseName = `Parse${set.name}s`
      const clearable = BUILDER_CONFIGS.find((c) => c.setName === set.name)?.clearable

      emitParamMap(
        mapName,
        "Maps each constant to the tuple of arguments that follow it.",
        set.params,
        clearable,
      )
      emitNameMap(nameMapName, set.params)

      if (set.subDispatch) {
        const subNameMapName = `${set.subDispatch.name}NameMap`
        emitParamMap(
          `${set.subDispatch.name}Map`,
          "Maps each sub-dispatch constant to the tuple of arguments that follow it.",
          set.subDispatch.params,
        )
        emitNameMap(subNameMapName, set.subDispatch.params)
      }

      // Recursive parser type
      lines.push("")
      lines.push(
        `/** Recursive type that validates a flat parameter list for ${set.name} constants. */`,
      )
      lines.push(`type ${parseName}<T extends readonly unknown[]> =`)
      lines.push("  T extends readonly [] ? [] :")
      lines.push("  T extends readonly [infer K, ...infer Rest]")

      if (set.subDispatch) {
        const subMapName = `${set.subDispatch.name}Map`
        const subNameMapName = `${set.subDispatch.name}NameMap`
        lines.push(`    ? K extends typeof ${set.subDispatch.constant}`)
        lines.push("      ? Rest extends readonly [infer S, ...infer ShapeRest]")
        lines.push(`        ? S extends keyof ${subMapName}`)
        lines.push(
          `          ? ShapeRest extends readonly [...${subMapName}[S], ...infer Remaining]`,
        )
        lines.push(
          `            ? [flag: K, shape: S, ...${subMapName}[S], ...${parseName}<Remaining>]`,
        )
        lines.push(
          `            : TypedListError<\`invalid arguments after \${${subNameMapName}[S & keyof ${subNameMapName}]}\`>`,
        )
        lines.push(`          : TypedListError<\`unknown shape type \${S & (string | number)}\`>`)
        lines.push("        : never")
        lines.push(`      : K extends keyof ${mapName}`)
      } else {
        lines.push(`    ? K extends keyof ${mapName}`)
      }

      lines.push(`        ? Rest extends readonly [...${mapName}[K], ...infer Remaining]`)
      lines.push(`          ? [flag: K, ...${mapName}[K], ...${parseName}<Remaining>]`)
      lines.push(
        `          : TypedListError<\`invalid arguments after \${${nameMapName}[K & keyof ${nameMapName}]}\`>`,
      )
      lines.push(`        : TypedListError<\`unknown parameter flag \${K & (string | number)}\`>`)
      lines.push("    : never")

      // Emit return map and recursive output mapper for sets with return types
      const hasReturns = set.params.some((r) => r.returns && r.returns.length > 0)
      if (hasReturns) {
        const returnMapName = `${set.name}ReturnMap`
        const mapperName = `Map${set.name}`

        // Sub-dispatch return type (e.g. PRIM_TYPE returns [shape_flag, ...shape_params])
        // Look for sub-dispatch on this set, or on a sibling set that shares the same constant
        const subDispatch =
          set.subDispatch ??
          typedListParams.sets.find(
            (s) => s.subDispatch && set.params.some((p) => p.name === s.subDispatch!.constant),
          )?.subDispatch
        const subDispatchConstant = subDispatch?.constant
        let subReturnType: string | undefined
        if (subDispatch) {
          const variants = subDispatch.params.map((shape) => {
            const shapeReturns = shape.args
              .map((a) => `${toCamelCase(a.name)}: ${mapListArgType(a.type)} | undefined`)
              .join(", ")
            return `[type: typeof ${shape.name}, ${shapeReturns}]`
          })
          subReturnType = variants.join(" | ")
        }

        lines.push("")
        lines.push(`/** Maps each ${set.name} constant to the tuple of values it returns. */`)
        lines.push(`interface ${returnMapName} {`)
        for (const rule of set.params) {
          if (subDispatchConstant && rule.name === subDispatchConstant && subReturnType) {
            // Sub-dispatch: return is a union of all shape return tuples
            lines.push(`  [${rule.name}]: ${subReturnType}`)
            continue
          }
          const returns = rule.returns ?? []
          if (returns.length === 0) {
            // Flags with no return (e.g. PRIM_LINK_TARGET) produce no output
            lines.push(`  [${rule.name}]: []`)
          } else {
            const namedReturns = returns
              .map((a) => `${toCamelCase(a.name)}: ${mapListArgType(a.type)} | undefined`)
              .join(", ")
            lines.push(`  [${rule.name}]: [${namedReturns}]`)
          }
        }
        lines.push("}")

        // Recursive output mapper: consumes input args, emits return values
        lines.push("")
        lines.push(
          `/** Recursively maps a flat ${set.name} parameter list to the corresponding return types. */`,
        )
        lines.push(`type ${mapperName}<T extends readonly unknown[]> =`)
        lines.push("  T extends readonly [] ? [] :")
        lines.push("  T extends readonly [infer K, ...infer Rest]")

        if (subDispatch) {
          const subMapName = `${subDispatch.name}Map`
          lines.push(`    ? K extends typeof ${subDispatch.constant}`)
          lines.push("      ? Rest extends readonly [infer S, ...infer ShapeRest]")
          lines.push(`        ? S extends keyof ${subMapName}`)
          lines.push(
            `          ? ShapeRest extends readonly [...${subMapName}[S], ...infer Remaining]`,
          )
          lines.push(
            `            ? [type: S, ...{ [I in keyof ${subMapName}[S]]: ${subMapName}[S][I] | undefined }, ...${mapperName}<Remaining>]`,
          )
          lines.push("            : never")
          lines.push("          : never")
          lines.push("        : never")
          lines.push(`      : K extends keyof ${mapName} & keyof ${returnMapName}`)
        } else {
          lines.push(`    ? K extends keyof ${mapName} & keyof ${returnMapName}`)
        }

        lines.push(`      ? Rest extends readonly [...${mapName}[K], ...infer Remaining]`)
        lines.push(`        ? [...${returnMapName}[K], ...${mapperName}<Remaining>]`)
        lines.push("        : never")
        lines.push("      : never")
        lines.push(`    : unknown[]`)
      }
    }

    lines.push("")
    sf.insertText(sf.getFullText().length, lines.join("\n"))
  }

  // Emit builder interfaces and root function declarations
  if (typedListParams) {
    const builderLines: string[] = []

    for (const config of BUILDER_CONFIGS) {
      const set = typedListParams.sets.find((s) => s.name === config.setName)
      if (!set) continue

      // Options-only roots skip the fluent builder interface entirely
      const optionsOnly = config.roots.every((r) => r.optionsArg)

      if (!optionsOnly) {
        const interfaceName = `${set.name}Builder`

        // Collect builder methods from params
        const methods: string[] = []
        for (const rule of set.params) {
          // Skip the link constant, it becomes .link() with a callback
          if (config.linkConstant && rule.name === config.linkConstant) continue

          const methodName = constantToMethodName(rule.name, config.prefix)
          const args = rule.args
            .map((a) => {
              const t = mapListArgType(a.type)
              const clear = argAcceptsEmptyString(config.clearable, rule.name, a.name)
              return `${toCamelCase(a.name)}: ${clear ? `${t} | ""` : t}`
            })
            .join(", ")
          methods.push(`  ${methodName}(${args}): ${interfaceName}`)
        }

        // Add per-shape methods for sub-dispatch (e.g. .typeBox(), .typeCylinder())
        if (set.subDispatch) {
          for (const shape of set.subDispatch.params) {
            const shapeName = constantToMethodName(shape.name, config.prefix)
            const args = shape.args
              .map((a) => `${toCamelCase(a.name)}: ${mapListArgType(a.type)}`)
              .join(", ")
            methods.push(`  ${shapeName}(${args}): ${interfaceName}`)
          }
        }

        // Add .link() method with callback if this set has a link constant
        if (config.linkConstant) {
          methods.push(
            `  link(linkTarget: number, cb: (link: ${interfaceName}) => ${interfaceName}): ${interfaceName}`,
          )
        }

        // Emit the interface
        builderLines.push("")
        builderLines.push(
          `/** Fluent builder for ${set.name} lists. Compiles to a flat parameter list at build time. */`,
        )
        builderLines.push(`interface ${interfaceName} {`)
        builderLines.push(...methods)
        builderLines.push("}")

        // Emit builder root function declarations (non-options roots only)
        for (const root of config.roots) {
          if (root.optionsArg) continue
          const args = root.preListArgs.concat(root.postListArgs ?? []).join(", ")
          builderLines.push("")
          builderLines.push(`declare function ${root.name}(${args}): ${interfaceName}`)
        }
      }

      // Emit options-object interfaces and overloads
      for (const root of config.roots) {
        if (!root.optionsArg) continue
        const optionsName = `${set.name}Options`
        const preArgs = root.preListArgs.join(", ")

        builderLines.push("")
        builderLines.push(`/** Options object for ${root.name}. All properties are optional. */`)
        builderLines.push(`interface ${optionsName} {`)
        for (const rule of set.params) {
          if (config.linkConstant && rule.name === config.linkConstant) continue
          const methodName = constantToMethodName(rule.name, config.prefix)
          const argTypes = rule.args.map((a) => mapListArgType(a.type))
          const type = argTypes.length === 1 ? argTypes[0] : `[${argTypes.join(", ")}]`
          builderLines.push(`  ${methodName}?: ${type}`)
        }
        // Include post-list args as properties (e.g. body for httpRequest)
        for (const postArg of root.postListArgs ?? []) {
          const [name, type] = postArg.split(": ")
          builderLines.push(`  ${name}?: ${type}`)
        }
        builderLines.push("}")
        // Look up the actual return type from the LSL function
        const lslFn = lsl.functions[`ll${root.llFunction}`]
        const retType = lslFn
          ? lslFn["slua-return"]
            ? mapLslReturnType(lslFn["slua-return"])
            : mapLslType(lslFn.return ?? "void")
          : "list"

        builderLines.push("")
        if (root.optionsReturnType) {
          const generic = `<const Opts extends ${optionsName}>`
          builderLines.push(
            `declare function ${root.name}${generic}(${preArgs}${preArgs ? ", " : ""}options: Opts): ${root.optionsReturnType}`,
          )
        } else {
          builderLines.push(
            `declare function ${root.name}(${preArgs}${preArgs ? ", " : ""}options: ${optionsName}): ${retType}`,
          )
        }
      }
    }

    sf.insertText(sf.getFullText().length, builderLines.join("\n") + "\n")
  }

  return sf.getFullText()
}

/**
 * Convert a constant name to a builder method name by stripping the set prefix
 * and converting to camelCase.
 *
 * PRIM_COLOR -> color
 * PRIM_TYPE_BOX -> typeBox
 * PSYS_SRC_BURST_RATE -> srcBurstRate
 * CAMERA_FOCUS_LOCKED -> focusLocked
 */
function constantToMethodName(name: string, prefix: string): string {
  const stripped = name.startsWith(prefix) ? name.slice(prefix.length) : name
  return toCamelCase(stripped)
}

/**
 * Generate the builder data module for the TSTL plugin.
 * This provides the method-to-constant mapping and root function configs
 * so the plugin can transform builder chains into flat Lua tables.
 */
export function emitBuilderData(typedListParams: TypedListParams): string {
  const lines: string[] = [
    "// Auto-generated by gen-types, do not edit manually.",
    "",
    "export interface BuilderRootDef {",
    "  llFunction: string",
    "  paramSet: string",
    "  preListArgs: number",
    "  postListArgs: number",
    "  optionsArg?: boolean",
    "  postListArgNames?: string[]",
    "  optionsDefaults?: Record<string, string>",
    "}",
    "",
    "export interface BuilderMethodDef {",
    "  constant: string",
    "  argCount: number",
    "}",
    "",
    "export interface BuilderSubDispatchDef {",
    "  dispatchConstant: string",
    "  shapeConstant: string",
    "  argCount: number",
    "  methodName: string",
    "}",
    "",
    "export interface BuilderSetDef {",
    "  methods: Record<string, BuilderMethodDef>",
    "  subDispatch?: BuilderSubDispatchDef[]",
    "  linkConstant?: string",
    "  linkMethod?: string",
    "}",
    "",
  ]

  // Emit root function map
  const rootEntries: string[] = []
  for (const config of BUILDER_CONFIGS) {
    const set = typedListParams.sets.find((s) => s.name === config.setName)
    if (!set) continue
    for (const root of config.roots) {
      const optionsFlag = root.optionsArg ? ", optionsArg: true" : ""
      const postNames =
        root.optionsArg && root.postListArgs?.length
          ? `, postListArgNames: [${root.postListArgs.map((a) => `"${a.split(": ")[0]}"`).join(", ")}]`
          : ""
      const defaults =
        root.optionsArg && root.optionsDefaults
          ? `, optionsDefaults: { ${Object.entries(root.optionsDefaults)
              .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
              .join(", ")} }`
          : ""
      rootEntries.push(
        `  ${root.name}: { llFunction: "${root.llFunction}", paramSet: "${set.name}", preListArgs: ${root.preListArgs.length}, postListArgs: ${root.postListArgs?.length ?? 0}${optionsFlag}${postNames}${defaults} },`,
      )
    }
  }
  lines.push("export const BUILDER_ROOTS: Record<string, BuilderRootDef> = {")
  lines.push(...rootEntries)
  lines.push("}")
  lines.push("")

  // Emit per-set method maps
  const setEntries: string[] = []
  for (const config of BUILDER_CONFIGS) {
    const set = typedListParams.sets.find((s) => s.name === config.setName)
    if (!set) continue

    const methodEntries: string[] = []
    for (const rule of set.params) {
      if (config.linkConstant && rule.name === config.linkConstant) continue
      const methodName = constantToMethodName(rule.name, config.prefix)
      methodEntries.push(
        `      ${methodName}: { constant: "${rule.name}", argCount: ${rule.args.length} },`,
      )
    }

    // Sub-dispatch shapes
    const subEntries: string[] = []
    if (set.subDispatch) {
      for (const shape of set.subDispatch.params) {
        const shapeName = constantToMethodName(shape.name, config.prefix)
        subEntries.push(
          `      { dispatchConstant: "${set.subDispatch.constant}", shapeConstant: "${shape.name}", argCount: ${shape.args.length}, methodName: "${shapeName}" },`,
        )
      }
    }

    setEntries.push(`  ${set.name}: {`)
    setEntries.push(`    methods: {`)
    setEntries.push(...methodEntries)
    setEntries.push(`    },`)
    if (subEntries.length > 0) {
      setEntries.push(`    subDispatch: [`)
      setEntries.push(...subEntries)
      setEntries.push(`    ],`)
    }
    if (config.linkConstant) {
      setEntries.push(`    linkConstant: "${config.linkConstant}",`)
      setEntries.push(`    linkMethod: "link",`)
    }
    setEntries.push(`  },`)
  }
  lines.push("export const BUILDER_SETS: Record<string, BuilderSetDef> = {")
  lines.push(...setEntries)
  lines.push("}")
  lines.push("")

  return lines.join("\n")
}

/**
 * Emits the global names the minifier must not shadow when renaming locals.
 * Only all-letter names are kept — minified names use a letters-only alphabet,
 * so names with digits or underscores can't collide.
 */
export function emitSluaGlobals(slua: SLuaDefinitions, lsl: LSLDefinitions): string {
  const names = new Set<string>()

  for (const mod of slua.modules) names.add(mod.name)

  for (const gv of slua.globalVariables) {
    if (!gv["slua-removed"]) names.add(gv.name)
  }

  for (const fn of slua.globalFunctions) names.add(fn.name)
  for (const fn of slua.builtinFunctions) names.add(fn.name)
  for (const c of slua.constants) names.add(c.name)
  for (const c of slua.builtinConstants) names.add(c.name)

  for (const [name, c] of Object.entries(lsl.constants)) {
    if (!c["slua-removed"]) names.add(name)
  }

  // Only names the minifier could generate (MINIFY_ALPHABET is letters-only).
  const minifiable = /^[A-Za-z]+$/
  const sorted = [...names].filter((n) => minifiable.test(n)).toSorted()

  return [
    "// Auto-generated by gen-types, do not edit manually.",
    "",
    "/** SLua runtime globals the minifier must not shadow with renamed locals. */",
    "export const SLUA_GLOBAL_NAMES: ReadonlySet<string> = new Set([",
    ...sorted.map((n) => `  ${JSON.stringify(n)},`),
    "])",
    "",
  ].join("\n")
}
