--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
end
-- End of Lua Library inline imports
local ____exports = {}
local ____arrays = require("arrays")
local nearby = ____arrays.nearby
local totalMagnitude = ____arrays.totalMagnitude
local ____objects = require("objects")
local updated = ____objects.updated
local keys = ____objects.keys
local ____control_2Dflow = require("control-flow")
local describe = ____control_2Dflow.describe
local greet = ____control_2Dflow.greet
local ____classes = require("classes")
local Greeter = ____classes.Greeter
local Counter = ____classes.Counter
local ____functions = require("functions")
local createRepeater = ____functions.createRepeater
local makeCounter = ____functions.makeCounter
--- Template literals -- compile to string concatenation
local owner = ll.GetOwner()
ll.Say(
    0,
    "Owner: " .. tostring(owner)
)
ll.Say(
    0,
    "Nearby positions: " .. tostring(#nearby)
)
ll.Say(
    0,
    "Total magnitude: " .. tostring(totalMagnitude)
)
ll.Say(
    0,
    "Config keys: " .. tostring(keys)
)
ll.Say(
    0,
    describe("hello")
)
ll.Say(
    0,
    describe(42)
)
--- Using imported classes
local greeter = __TS__New(Greeter, 0, "Bot")
greeter:greet("World")
--- Enums -- compile to bidirectional Lua tables
local Channel = Channel or ({})
Channel.Public = 0
Channel[Channel.Public] = "Public"
Channel.Debug = 42
Channel[Channel.Debug] = "Debug"
Channel.Private = 100
Channel[Channel.Private] = "Private"
ll.Say(
    Channel.Public,
    "Updated config range: " .. tostring(updated.range)
)
--- Constructors -- compile to create() calls
local pos = vector.create(128, 128, 20)
local rot = quaternion.create(0, 0, 0, 1)
--- Operator overloads -- a.add(b) compiles to a + b
local scaled = pos * 2
local moved = pos + vector.create(0, 0, 10)
LLEvents:on(
    "touch_start",
    function(detected)
        local name = ll.DetectedName(detected[1].index)
        greet(name)
        local repeater = createRepeater(0, "Touched by " .. name)
        repeater()
        repeater()
        Counter:increment()
        ll.SetText(
            "Touches: " .. tostring(Counter:getCount()),
            vector.create(1, 1, 1),
            1
        )
    end
)
--- Timer -- periodic callback
local stats = makeCounter()
LLTimers:every(
    10,
    function()
        stats:next()
        ll.SetText(
            "Ticks: " .. tostring(stats:value()),
            vector.one,
            1
        )
    end
)
return ____exports
