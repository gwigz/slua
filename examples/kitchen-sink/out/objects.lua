--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__ObjectAssign(target, ...)
    local sources = {...}
    for i = 1, #sources do
        local source = sources[i]
        for key in pairs(source) do
            target[key] = source[key]
        end
    end
    return target
end

local function __TS__ObjectKeys(obj)
    local result = {}
    local len = 0
    for key in pairs(obj) do
        len = len + 1
        result[len] = key
    end
    return result
end

local function __TS__ObjectValues(obj)
    local result = {}
    local len = 0
    for key in pairs(obj) do
        len = len + 1
        result[len] = obj[key]
    end
    return result
end

local function __TS__ObjectEntries(obj)
    local result = {}
    local len = 0
    for key in pairs(obj) do
        len = len + 1
        result[len] = {key, obj[key]}
    end
    return result
end
-- End of Lua Library inline imports
local ____exports = {}
--- Object destructuring -- pull properties into variables
local config = {channel = 42, range = 10, name = "Scanner"}
local channel = config.channel
local range = config.range
local name = config.name
--- Object spread -- clone and extend
local updated = __TS__ObjectAssign({}, config, {range = 20})
--- Object.keys / Object.values / Object.entries
local keys = __TS__ObjectKeys(config)
local values = __TS__ObjectValues(config)
for ____, ____value in ipairs(__TS__ObjectEntries(config)) do
    local key = ____value[1]
    local value = ____value[2]
    ll.Say(
        0,
        (key .. " = ") .. tostring(value)
    )
end
--- Computed property names
local field = "color"
local dynamic = {[field] = vector.create(1, 0, 0)}
--- Optional chaining -- safe property access
local settings = {}
local ____opt_0 = settings.debug
local verbose = ____opt_0 and ____opt_0.verbose
local ch = config.channel
if ch == nil then
    ch = 0
end
local label = config.name
if label == nil then
    label = "Unknown"
end
____exports.updated = updated
____exports.keys = keys
____exports.values = values
____exports.dynamic = dynamic
____exports.verbose = verbose
____exports.ch = ch
____exports.label = label
return ____exports
