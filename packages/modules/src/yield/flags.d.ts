/**
 * Compile-time flag: enable {@link requestAgentData}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DATASERVER_AGENT: boolean

/**
 * Compile-time flag: enable {@link requestDisplayName}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DATASERVER_DISPLAY_NAME: boolean

/**
 * Compile-time flag: enable {@link requestSimulatorData}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DATASERVER_SIM: boolean

/**
 * Compile-time flag: enable {@link requestInventoryData}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DATASERVER_INVENTORY: boolean

/**
 * Compile-time flag: enable {@link readNotecardLine}, {@link readNotecard}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DATASERVER_NOTECARD: boolean

/**
 * Compile-time flag: enable {@link findNotecardTextCount}.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const YIELD_DATASERVER_TEXT_COUNT: boolean

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
