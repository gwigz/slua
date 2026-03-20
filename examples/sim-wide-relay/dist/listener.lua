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
["listener"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local handlePrivateMessage, assignAvatar, unassignAvatar, followAvatar, handleRelayedMessage, RELAY_DELAY, DEDUP_WINDOW, assignedAvatar, listenHandle, hearHandle, recentMessages, recentCount
local ____shared = require("shared")
local PRIVATE_CHANNEL = ____shared.PRIVATE_CHANNEL
local sign = ____shared.sign
local verify = ____shared.verify
function handlePrivateMessage(text)
    if string.find(text, "RELAY|", 1, true) == 1 then
        handleRelayedMessage(text)
        return
    end
    if string.find(text, "ASSIGN|", 1, true) == 1 then
        assignAvatar(uuid.create(string.sub(text, 8)))
        return
    end
    if text == "UNASSIGN" then
        unassignAvatar()
        return
    end
    if text == "KILL" then
        ll.Die()
        return
    end
end
function assignAvatar(avatar)
    if listenHandle ~= nil then
        ll.ListenRemove(listenHandle)
    end
    if hearHandle ~= nil then
        ll.ListenRemove(hearHandle)
    end
    assignedAvatar = avatar
    listenHandle = ll.Listen(0, "", avatar, "")
    hearHandle = ll.Listen(
        0,
        "",
        uuid.create(""),
        ""
    )
    followAvatar()
end
function unassignAvatar()
    if listenHandle ~= nil then
        ll.ListenRemove(listenHandle)
        listenHandle = nil
    end
    if hearHandle ~= nil then
        ll.ListenRemove(hearHandle)
        hearHandle = nil
    end
    assignedAvatar = nil
    recentMessages = {}
    recentCount = 0
end
function followAvatar()
    if not assignedAvatar then
        return
    end
    local details = ll.GetObjectDetails(assignedAvatar, {OBJECT_POS})
    if #details == 0 then
        return
    end
    local avatarPos = details[1]
    ll.SetRegionPos(avatarPos)
end
function handleRelayedMessage(text)
    if not assignedAvatar then
        return
    end
    local speakerId = string.sub(text, 7, 42)
    local message = string.sub(text, 44)
    local hash = (speakerId .. "|") .. message
    LLTimers:once(
        RELAY_DELAY,
        function()
            if not assignedAvatar then
                return
            end
            local now = ll.GetTime()
            if recentMessages[hash] ~= nil and now - recentMessages[hash] < DEDUP_WINDOW then
                return
            end
            if recentMessages[hash] == nil then
                recentCount = recentCount + 1
            end
            recentMessages[hash] = now
            ll.RegionSay(
                PRIVATE_CHANNEL,
                sign((((("SAY|" .. tostring(assignedAvatar)) .. "|") .. speakerId) .. "|") .. message)
            )
            for key in pairs(recentMessages) do
                if now - recentMessages[key] >= DEDUP_WINDOW then
                    recentMessages[key] = nil
                    recentCount = recentCount - 1
                end
            end
        end
    )
end
--- How often to reposition (seconds)
local FOLLOW_INTERVAL = 0.1
RELAY_DELAY = 0.1
DEDUP_WINDOW = 2
--- Max entries before wiping the dedup table
local DEDUP_MAX = 50
local owner = ll.GetOwner()
recentMessages = {}
recentCount = 0
ll.Listen(
    PRIVATE_CHANNEL,
    "",
    uuid.create(""),
    ""
)
LLEvents:on(
    "listen",
    function(channel, _name, id, text)
        if channel == PRIVATE_CHANNEL then
            if ll.GetOwnerKey(id) ~= owner then
                return
            end
            local payload = verify(text)
            if payload == nil then
                return
            end
            handlePrivateMessage(payload)
            return
        end
        if channel ~= 0 or not assignedAvatar then
            return
        end
        if id == assignedAvatar then
            ll.RegionSay(
                PRIVATE_CHANNEL,
                sign((("CHAT|" .. tostring(assignedAvatar)) .. "|") .. text)
            )
            return
        end
        if recentCount >= DEDUP_MAX then
            recentMessages = {}
            recentCount = 0
        end
        local hash = (tostring(id) .. "|") .. text
        if recentMessages[hash] == nil then
            recentCount = recentCount + 1
        end
        recentMessages[hash] = ll.GetTime()
    end
)
LLTimers:every(
    FOLLOW_INTERVAL,
    function() return followAvatar() end
)
return ____exports
 end,
}
local ____entry = require("listener", ...)
return ____entry
