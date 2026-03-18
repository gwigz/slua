# Kitchen Sink

Kitchen-sink example showing TypeScript language features compiled to Lua via TSTL.

## Files

| File | Features |
| --- | --- |
| `arrays.ts` | `.map()`, `.filter()`, `.find()`, `.reduce()`, spread, `for...of`, destructuring |
| `objects.ts` | Destructuring, spread, `Object.keys/values/entries`, optional chaining |
| `control-flow.ts` | `for...of`, `??` nullish coalescing, type narrowing, `switch` |
| `classes.ts` | Inheritance, static members, parameter properties, `readonly` |
| `functions.ts` | Rest/default params, closures, higher-order functions |
| `main.ts` | Imports, template literals, JSDoc comments, enums, operator overloads |

## Build

```bash
bunx tstl --project tsconfig.json
```

Output is written to `out/`.
