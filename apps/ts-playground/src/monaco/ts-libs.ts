// TypeScript lib files bundled as raw strings for the browser.
// With noLib: true, TypeScript won't auto-load these -- we provide them
// as virtual files (TSTL worker) or extra libs (Monaco editor).
import libEs5 from "typescript/lib/lib.es5.d.ts?raw"
import libEs2015Core from "typescript/lib/lib.es2015.core.d.ts?raw"
import libEs2015Collection from "typescript/lib/lib.es2015.collection.d.ts?raw"
import libEs2015Iterable from "typescript/lib/lib.es2015.iterable.d.ts?raw"
import libEs2015Generator from "typescript/lib/lib.es2015.generator.d.ts?raw"
import libEs2015Promise from "typescript/lib/lib.es2015.promise.d.ts?raw"
import libEs2015Proxy from "typescript/lib/lib.es2015.proxy.d.ts?raw"
import libEs2015Reflect from "typescript/lib/lib.es2015.reflect.d.ts?raw"
import libEs2015Symbol from "typescript/lib/lib.es2015.symbol.d.ts?raw"
import libEs2015SymbolWK from "typescript/lib/lib.es2015.symbol.wellknown.d.ts?raw"
import libEs2016ArrayInclude from "typescript/lib/lib.es2016.array.include.d.ts?raw"
import libEs2017Object from "typescript/lib/lib.es2017.object.d.ts?raw"
import libEs2017String from "typescript/lib/lib.es2017.string.d.ts?raw"
import libEs2019Array from "typescript/lib/lib.es2019.array.d.ts?raw"
import libEs2019Object from "typescript/lib/lib.es2019.object.d.ts?raw"
import libEs2019String from "typescript/lib/lib.es2019.string.d.ts?raw"
import libEs2021String from "typescript/lib/lib.es2021.string.d.ts?raw"
import libEs2022Array from "typescript/lib/lib.es2022.array.d.ts?raw"
import libEs2022Object from "typescript/lib/lib.es2022.object.d.ts?raw"
import libEs2022String from "typescript/lib/lib.es2022.string.d.ts?raw"
import libEs2023Array from "typescript/lib/lib.es2023.array.d.ts?raw"

const contents = [
  libEs5,
  libEs2015Core,
  libEs2015Collection,
  libEs2015Iterable,
  libEs2015Generator,
  libEs2015Promise,
  libEs2015Proxy,
  libEs2015Reflect,
  libEs2015Symbol,
  libEs2015SymbolWK,
  libEs2016ArrayInclude,
  libEs2017Object,
  libEs2017String,
  libEs2019Array,
  libEs2019Object,
  libEs2019String,
  libEs2021String,
  libEs2022Array,
  libEs2022Object,
  libEs2022String,
  libEs2023Array,
]

// Re-export the canonical name list from ts-lib-names.ts
export { TS_LIB_NAMES } from "./ts-lib-names"
import { TS_LIB_NAMES } from "./ts-lib-names"

/** [filename, content] pairs for all bundled TypeScript lib files. */
export const tsLibs: [string, string][] = TS_LIB_NAMES.map((name, i) => [name, contents[i]])
