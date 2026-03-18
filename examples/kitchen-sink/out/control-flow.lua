--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
--- for...of -- iterate arrays cleanly
local names = {"Alice", "Bob", "Charlie"}
for ____, name in ipairs(names) do
    ll.Say(0, ("Hello " .. name) .. "!")
end
--- Nullish coalescing -- default values for null/undefined
local userChannel = nil
local activeChannel = userChannel or 42
--- Ternary expressions
local status = if activeChannel > 0 then "custom" else "public"
--- Type narrowing with typeof
local function describe(value)
    if type(value) == "string" then
        return "text: " .. value
    end
    return "number: " .. tostring(value)
end
--- Type narrowing with truthiness
local function greet(name)
    if name then
        ll.Say(0, ("Hi " .. name) .. "!")
    else
        ll.Say(0, "Hi stranger!")
    end
end
--- Switch statements
local function channelName(ch)
    repeat
        local ____switch10 = ch
        local ____cond10 = ____switch10 == 0
        if ____cond10 then
            return "public"
        end
        ____cond10 = ____cond10 or ____switch10 == DEBUG_CHANNEL
        if ____cond10 then
            return "debug"
        end
        do
            return "channel " .. tostring(ch)
        end
    until true
end
____exports.describe = describe
____exports.greet = greet
____exports.channelName = channelName
return ____exports
