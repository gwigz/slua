--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
--- Only JSDoc comments are preserved in the Lua output
local owner = ll.GetOwner()
LLEvents:on(
    "touch_start",
    function(events)
        for ____, event in ipairs(events) do
            local key = event:getKey()
            if key == owner then
                ll.Say(
                    0,
                    ("Hello secondlife:///app/agent/" .. tostring(key)) .. "/about!"
                )
                return
            end
        end
    end
)
