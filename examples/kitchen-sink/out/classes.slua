--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local function __TS__ClassExtends(target, base)
    target.____super = base
    local staticMetatable = setmetatable({__index = base}, base)
    setmetatable(target, staticMetatable)
    local baseMetatable = getmetatable(base)
    if baseMetatable then
        if type(baseMetatable.__index) == "function" then
            staticMetatable.__index = baseMetatable.__index
        end
        if type(baseMetatable.__newindex) == "function" then
            staticMetatable.__newindex = baseMetatable.__newindex
        end
    end
    setmetatable(target.prototype, base.prototype)
    if type(base.prototype.__index) == "function" then
        target.prototype.__index = base.prototype.__index
    end
    if type(base.prototype.__newindex) == "function" then
        target.prototype.__newindex = base.prototype.__newindex
    end
    if type(base.prototype.__tostring) == "function" then
        target.prototype.__tostring = base.prototype.__tostring
    end
end

local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
end
-- End of Lua Library inline imports
local ____exports = {}
--- Parameter properties -- shorthand for declaring and assigning constructor params
local Greeter = __TS__Class()
Greeter.name = "Greeter"
function Greeter.prototype.____constructor(self, channel, prefix)
    if prefix == nil then
        prefix = "Says"
    end
    self.channel = channel
    self.prefix = prefix
end
function Greeter.prototype.greet(self, name)
    ll.Say(self.channel, ((self.prefix .. ": Hello ") .. name) .. "!")
end
function Greeter.prototype.getChannel(self)
    return self.channel
end
--- Inheritance with extends
local LoudGreeter = __TS__Class()
LoudGreeter.name = "LoudGreeter"
__TS__ClassExtends(LoudGreeter, Greeter)
function LoudGreeter.prototype.____constructor(self, channel)
    Greeter.prototype.____constructor(self, channel, "Shouts")
end
function LoudGreeter.prototype.greet(self, name)
    ll.Shout(
        self:getChannel(),
        ("HELLO " .. name) .. "!!!"
    )
end
--- Static members
local Counter = __TS__Class()
Counter.name = "Counter"
function Counter.prototype.____constructor(self)
end
function Counter.increment(self)
    Counter.count = Counter.count + 1
    return Counter.count
end
function Counter.reset(self)
    Counter.count = 0
end
function Counter.getCount(self)
    return Counter.count
end
Counter.count = 0
local greeter = __TS__New(Greeter, 0)
local loud = __TS__New(LoudGreeter, 0)
greeter:greet("World")
loud:greet("World")
Counter:increment()
Counter:increment()
ll.Say(
    0,
    "Count: " .. tostring(Counter:getCount())
)
____exports.Greeter = Greeter
____exports.LoudGreeter = LoudGreeter
____exports.Counter = Counter
return ____exports
