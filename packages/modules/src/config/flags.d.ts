/**
 * Compile-time flag: enable the YAML (`key: value`) notecard parser.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const CONFIG_YAML_PARSER: boolean

/**
 * Compile-time flag: enable the lljson notecard parser.
 *
 * @define Set via `@gwigz/slua-tstl-plugin` `define` option. Code guarded
 * by this flag is stripped from the Lua output when set to `false`.
 */
declare const CONFIG_LLJSON_PARSER: boolean
