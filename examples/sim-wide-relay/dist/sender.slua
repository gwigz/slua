--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]

local ____modules = {}
local ____moduleCache = {}
local ____originalRequire = require
local function require(file, ...)
    if ____moduleCache[file] then
        return ____moduleCache[file].value
    end
    if ____modules[file] then
        local module = ____modules[file]
        local value = nil
        if (select("#", ...) > 0) then value = module(...) else value = module(file) end
        ____moduleCache[file] = { value = value }
        return value
    else
        if ____originalRequire then
            return ____originalRequire(file)
        else
            error("module '" .. file .. "' not found")
        end
    end
end
____modules = {
["shared"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
____exports.PRIVATE_CHANNEL = -1731704569
____exports.IGNORED_AVATARS = {}
--- Time bucket size in seconds for message signing
local SIGN_WINDOW = 2
function ____exports.sign(payload)
    local bucket = ll.GetUnixTime() // SIGN_WINDOW
    return (string.sub(
        ll.MD5String(
            (tostring(bucket) .. "|") .. payload,
            ____exports.PRIVATE_CHANNEL
        ),
        1,
        8
    ) .. "|") .. payload
end
function ____exports.verify(text)
    if #text < 10 then
        return nil
    end
    local hash = string.sub(text, 1, 8)
    local payload = string.sub(text, 10)
    local bucket = ll.GetUnixTime() // SIGN_WINDOW
    if hash == string.sub(
        ll.MD5String(
            (tostring(bucket) .. "|") .. payload,
            ____exports.PRIVATE_CHANNEL
        ),
        1,
        8
    ) or hash == string.sub(
        ll.MD5String(
            (tostring(bucket - 1) .. "|") .. payload,
            ____exports.PRIVATE_CHANNEL
        ),
        1,
        8
    ) then
        return payload
    end
    return nil
end
return ____exports
 end,
["sender"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____shared = require("shared")
local IGNORED_AVATARS = ____shared.IGNORED_AVATARS
local PRIVATE_CHANNEL = ____shared.PRIVATE_CHANNEL
local sign = ____shared.sign
local verify = ____shared.verify
local SAY_RANGE = tonumber(ll.GetEnv("chat_range"))
local owner = ll.GetOwner()
local function formatRelayMessage(speakerId, message)
    local link = ("secondlife:///app/agent/" .. speakerId) .. "/inspect"
    if string.find(message, "/me'", 1, true) == 1 then
        return ("/me " .. link) .. string.sub(message, 4)
    end
    if string.find(message, "/me ", 1, true) == 1 then
        return (("/me " .. link) .. " ") .. string.sub(message, 5)
    end
    return (("/me " .. link) .. ": ") .. message
end
local function relayToOutOfRange(speakerId, message)
    local speakerDetails = ll.GetObjectDetails(speakerId, {OBJECT_POS})
    if #speakerDetails == 0 then
        return
    end
    local speakerPos = speakerDetails[1]
    local agents = ll.GetAgentList(AGENT_LIST_REGION, {})
    local relayText = (("RELAY|" .. tostring(speakerId)) .. "|") .. message
    for ____, agent in ipairs(agents) do
        if agent == speakerId then
            continue
        end
        local agentKey = tostring(agent)
        if table.find(IGNORED_AVATARS, agentKey) ~= nil then
            continue
        end
        local listenerKey = ll.LinksetDataRead("a:" .. agentKey)
        if listenerKey == "" then
            continue
        end
        local agentDetails = ll.GetObjectDetails(agent, {OBJECT_POS})
        if #agentDetails == 0 then
            continue
        end
        local agentPos = agentDetails[1]
        local distance = ll.VecDist(speakerPos, agentPos)
        if distance <= SAY_RANGE then
            continue
        end
        ll.RegionSayTo(
            uuid.create(listenerKey),
            PRIVATE_CHANNEL,
            sign(relayText)
        )
    end
end
LLEvents:on(
    "listen",
    function(channel, _name, id, text)
        if channel ~= PRIVATE_CHANNEL then
            return
        end
        if ll.GetOwnerKey(id) ~= owner then
            return
        end
        local payload = verify(text)
        if payload == nil then
            return
        end
        if string.find(payload, "CHAT|", 1, true) == 1 then
            local speakerKey = string.sub(payload, 6, 41)
            if table.find(IGNORED_AVATARS, speakerKey) ~= nil then
                return
            end
            relayToOutOfRange(
                uuid.create(speakerKey),
                string.sub(payload, 43)
            )
            return
        end
        if string.find(payload, "SAY|", 1, true) == 1 then
            local avatar = uuid.create(string.sub(payload, 5, 40))
            local speakerId = string.sub(payload, 42, 77)
            local message = string.sub(payload, 79)
            ll.RegionSayTo(
                avatar,
                0,
                formatRelayMessage(speakerId, message)
            )
            return
        end
    end
)
ll.SetObjectName("*")
ll.Listen(
    PRIVATE_CHANNEL,
    "",
    uuid.create(""),
    ""
)
return ____exports
 end,
}
local ____entry = require("sender", ...)
return ____entry
