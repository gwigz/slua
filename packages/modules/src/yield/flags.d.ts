/**
 * Compile-time flag: enable dataserver yield wrappers.
 *
 * Guards: {@link requestAgentData}, {@link requestDisplayName},
 * {@link requestSimulatorData}, {@link requestInventoryData},
 * {@link readNotecardLine}, {@link readNotecard}, {@link findNotecardTextCount}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DATASERVER: boolean

/**
 * Compile-time flag: enable experience KV store yield wrappers.
 *
 * Guards: {@link kvRead}, {@link kvCreate}, {@link kvUpdate},
 * {@link kvDelete}, {@link kvSize}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_KV: boolean

/**
 * Compile-time flag: enable dialog/textbox yield wrappers.
 *
 * Guards: {@link dialog}, {@link textBox}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DIALOG: boolean

/**
 * Compile-time flag: enable HTTP request yield wrapper.
 *
 * Guards: {@link httpRequest}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_HTTP: boolean

/**
 * Compile-time flag: enable permissions yield wrappers.
 *
 * Guards: {@link requestPermissions}, {@link transferMoney}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_PERMISSIONS: boolean

/**
 * Compile-time flag: enable sensor yield wrapper.
 *
 * Guards: {@link sensor}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_SENSOR: boolean
