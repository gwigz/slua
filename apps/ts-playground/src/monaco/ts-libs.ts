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

/** [filename, content] pairs for all bundled TypeScript lib files. */
export const tsLibs: [string, string][] = [
  ["lib.es5.d.ts", libEs5],
  ["lib.es2015.core.d.ts", libEs2015Core],
  ["lib.es2015.collection.d.ts", libEs2015Collection],
  ["lib.es2015.iterable.d.ts", libEs2015Iterable],
  ["lib.es2015.generator.d.ts", libEs2015Generator],
  ["lib.es2015.promise.d.ts", libEs2015Promise],
  ["lib.es2015.proxy.d.ts", libEs2015Proxy],
  ["lib.es2015.reflect.d.ts", libEs2015Reflect],
  ["lib.es2015.symbol.d.ts", libEs2015Symbol],
  ["lib.es2015.symbol.wellknown.d.ts", libEs2015SymbolWK],
  ["lib.es2016.array.include.d.ts", libEs2016ArrayInclude],
  ["lib.es2017.object.d.ts", libEs2017Object],
  ["lib.es2017.string.d.ts", libEs2017String],
  ["lib.es2019.array.d.ts", libEs2019Array],
  ["lib.es2019.object.d.ts", libEs2019Object],
  ["lib.es2019.string.d.ts", libEs2019String],
  ["lib.es2021.string.d.ts", libEs2021String],
  ["lib.es2022.array.d.ts", libEs2022Array],
  ["lib.es2022.object.d.ts", libEs2022Object],
  ["lib.es2022.string.d.ts", libEs2022String],
  ["lib.es2023.array.d.ts", libEs2023Array],
]
