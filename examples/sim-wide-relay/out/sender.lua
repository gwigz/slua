--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local relayToOutOfRange, PRIVATE_CHANNEL, SAY_RANGE
function relayToOutOfRange(speakerId, message)
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
        local agentDetails = ll.GetObjectDetails(agent, {OBJECT_POS})
        if #agentDetails == 0 then
            continue
        end
        local agentPos = agentDetails[1]
        local distance = ll.VecDist(speakerPos, agentPos)
        if distance <= SAY_RANGE then
            continue
        end
        local listenerKey = ll.LinksetDataRead("a:" .. tostring(agent))
        if listenerKey == "" then
            continue
        end
        local listener = uuid.create(listenerKey)
        ll.RegionSayTo(listener, PRIVATE_CHANNEL, relayText)
    end
end
PRIVATE_CHANNEL = -1731704569
SAY_RANGE = tonumber(ll.GetEnv("chat_range"))
local owner = ll.GetOwner()
ll.Listen(
    PRIVATE_CHANNEL,
    "",
    uuid.create(""),
    ""
)
LLEvents:on(
    "listen",
    function(channel, _name, id, text)
        if channel ~= PRIVATE_CHANNEL then
            return
        end
        if ll.GetOwnerKey(id) ~= owner then
            return
        end
        if not (string.find(text, "CHAT|", 1, true) == 1) then
            return
        end
        local speakerId = uuid.create(string.sub(text, 6, 41))
        local message = string.sub(text, 43)
        relayToOutOfRange(speakerId, message)
    end
)
