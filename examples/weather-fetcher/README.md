# Weather Fetcher

Realistic SLua script that fetches weather data from an API and displays it as hover text.

## Features demonstrated

- **Interfaces** for API response types and config
- **Enums** for request state machine
- **Object destructuring** for config
- **Template literals** for URL building and display formatting
- **Optional chaining** (`data?.current`) for safe JSON access
- **Nullish coalescing** (`??`) for fallback values
- **Type narrowing** for success/error handling
- **`lljson.decode()`** for JSON parsing
- **`ll.HTTPRequest()`** with typed parameter lists
- **Events:** `http_response`, `touch_start`, `listen`
- **`LLTimers.every()`** for auto-refresh
- **Switch statements** for chat command handling

## Build

```bash
bunx tstl --project tsconfig.json
```

Output is written to `out/main.lua`.
