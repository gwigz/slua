--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local rezBatched, writeAssignment, assignListener, ensureBuffer, assignedCount, totalListeners, updateDiagnostics, PRIVATE_CHANNEL, LISTENER_OBJECT, poolSize, POOL_BUFFER, assignedListeners, freeListeners, REZ_BATCH_SIZE
function rezBatched(count)
    local pos = ll.GetPos()
    local rot = ll.GetRot()
    local remaining = count
    local function rezBatch()
        local batch = math.min(REZ_BATCH_SIZE, remaining)
        do
            local i = 0
            while i < batch do
                ll.RezObject(
                    LISTENER_OBJECT,
                    pos,
                    vector.create(0, 0, 0),
                    rot,
                    0
                )
                i = i + 1
            end
        end
        remaining = remaining - batch
        if remaining > 0 then
            LLTimers:once(1, rezBatch)
        end
    end
    rezBatch()
end
function writeAssignment(avatar, listener)
    ll.LinksetDataWrite(
        "l:" .. tostring(listener),
        tostring(avatar)
    )
    ll.LinksetDataWrite(
        "a:" .. tostring(avatar),
        tostring(listener)
    )
end
function assignListener(avatar)
    if #freeListeners == 0 then
        ll.Say(
            DEBUG_CHANNEL,
            "Pool exhausted, no listener for " .. ll.Key2Name(avatar)
        )
        return
    end
    local listener = table.remove(freeListeners)
    local key = tostring(avatar)
    assignedListeners[key] = listener
    writeAssignment(avatar, listener)
    ll.RegionSayTo(listener, PRIVATE_CHANNEL, "ASSIGN|" .. key)
end
function ensureBuffer()
    local needed = POOL_BUFFER - #freeListeners
    if needed > 0 then
        local room = poolSize - totalListeners()
        local toRez = math.min(needed, room)
        if toRez > 0 then
            rezBatched(toRez)
        end
    end
end
function assignedCount()
    local count = 0
    for _ in pairs(assignedListeners) do
        count = count + 1
    end
    return count
end
function totalListeners()
    return assignedCount() + #freeListeners
end
function updateDiagnostics()
    local assigned = assignedCount()
    local free = #freeListeners
    local total = assigned + free
    local text = (((((("Sim-Wide Chat\nPool: " .. tostring(total)) .. "/") .. tostring(poolSize)) .. "\nAssigned: ") .. tostring(assigned)) .. " ⋅ Free: ") .. tostring(free)
    local color = if free == 0 then vector.create(1, 0.3, 0.3) else vector.create(0.5, 1, 0.5)
    ll.SetLinkPrimitiveParamsFast(LINK_THIS, {PRIM_TEXT, text, color, 1})
end
PRIVATE_CHANNEL = -1731704569
LISTENER_OBJECT = "Relay Listener"
--- How often to poll for avatar changes (seconds)
local POLL_INTERVAL = 3
poolSize = tonumber(ll.GetEnv("agent_limit"))
POOL_BUFFER = 10
--- Maximum free listeners before culling excess
local POOL_BUFFER_MAX = 20
assignedListeners = {}
freeListeners = {}
REZ_BATCH_SIZE = 20
LLEvents:on(
    "object_rez",
    function(rezzedId)
        freeListeners[#freeListeners + 1] = rezzedId
    end
)
local function clearAssignment(avatarKey, listener)
    ll.LinksetDataWrite(
        "l:" .. tostring(listener),
        ""
    )
    ll.LinksetDataWrite("a:" .. avatarKey, "")
end
local function pollAgents()
    local agents = ll.GetAgentList(AGENT_LIST_REGION, {})
    local agentKeys = {}
    for ____, agent in ipairs(agents) do
        agentKeys[tostring(agent)] = true
    end
    for key in pairs(assignedListeners) do
        if agentKeys[key] then
            continue
        end
        local listener = assignedListeners[key]
        ll.RegionSayTo(listener, PRIVATE_CHANNEL, "UNASSIGN")
        clearAssignment(key, listener)
        assignedListeners[key] = nil
        freeListeners[#freeListeners + 1] = listener
    end
    for ____, agent in ipairs(agents) do
        if assignedListeners[tostring(agent)] == nil then
            assignListener(agent)
        end
    end
    ensureBuffer()
    updateDiagnostics()
end
local function verifyListeners()
    local rezCount = 0
    local remaining = {}
    for ____, listener in ipairs(freeListeners) do
        if #ll.GetObjectDetails(listener, {OBJECT_POS}) > 0 then
            remaining[#remaining + 1] = listener
        else
            rezCount = rezCount + 1
        end
    end
    freeListeners = remaining
    for key in pairs(assignedListeners) do
        local listener = assignedListeners[key]
        if #ll.GetObjectDetails(listener, {OBJECT_POS}) == 0 then
            clearAssignment(key, listener)
            assignedListeners[key] = nil
            rezCount = rezCount + 1
        end
    end
    if rezCount > 0 then
        ll.Say(
            DEBUG_CHANNEL,
            tostring(rezCount) .. " listener(s) missing, rezzing replacements..."
        )
        rezBatched(rezCount)
    end
end
local function cullExcess()
    while #freeListeners > POOL_BUFFER_MAX do
        local listener = table.remove(freeListeners)
        ll.RegionSayTo(listener, PRIVATE_CHANNEL, "KILL")
    end
end
ll.RegionSay(PRIVATE_CHANNEL, "KILL")
ll.LinksetDataReset()
local initialPool = POOL_BUFFER
ll.SetLinkPrimitiveParamsFast(
    LINK_THIS,
    {
        PRIM_TEXT,
        ("Sim-Wide Chat\nRezzing " .. tostring(initialPool)) .. " listeners...",
        vector.create(1, 1, 0),
        1
    }
)
rezBatched(initialPool)
local rezCheck
rezCheck = LLTimers:every(
    1,
    function()
        if #freeListeners < initialPool then
            return
        end
        LLTimers:off(rezCheck)
        pollAgents()
        LLTimers:every(POLL_INTERVAL, pollAgents)
        LLTimers:every(
            30,
            function()
                verifyListeners()
                cullExcess()
            end
        )
    end
)
