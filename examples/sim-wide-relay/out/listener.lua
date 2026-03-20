--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local handlePrivateMessage, assignAvatar, unassignAvatar, followAvatar, formatRelayMessage, handleRelayedMessage, RELAY_DELAY, DEDUP_WINDOW, assignedAvatar, listenHandle, hearHandle, recentMessages, recentCount
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
    ll.SetObjectName("*")
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
function formatRelayMessage(speakerId, message)
    local link = ("secondlife:///app/agent/" .. speakerId) .. "/inspect"
    if string.find(message, "/me'", 1, true) == 1 then
        return ("/me " .. link) .. string.sub(message, 4)
    end
    if string.find(message, "/me ", 1, true) == 1 then
        return (("/me " .. link) .. " ") .. string.sub(message, 5)
    end
    return (("/me " .. link) .. ": ") .. message
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
            for key in pairs(recentMessages) do
                if now - recentMessages[key] >= DEDUP_WINDOW then
                    recentMessages[key] = nil
                    recentCount = recentCount - 1
                end
            end
            ll.RegionSayTo(
                assignedAvatar,
                0,
                formatRelayMessage(speakerId, message)
            )
        end
    )
end
local PRIVATE_CHANNEL = -1731704569
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
            handlePrivateMessage(text)
            return
        end
        if channel ~= 0 or not assignedAvatar then
            return
        end
        if id == assignedAvatar then
            ll.RegionSay(
                PRIVATE_CHANNEL,
                (("CHAT|" .. tostring(assignedAvatar)) .. "|") .. text
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
