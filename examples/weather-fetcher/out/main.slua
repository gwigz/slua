--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local config = {
    apiUrl = "https://wttr.in",
    refreshInterval = 300,
    chatChannel = 42,
    location = "San+Francisco",
    format = "%l|%C|%t|%h|%w"
}
local apiUrl = config.apiUrl
local refreshInterval = config.refreshInterval
local chatChannel = config.chatChannel
local location = config.location
local format = config.format
--- Enum for request lifecycle
local RequestState = RequestState or ({})
RequestState.Idle = 0
RequestState[RequestState.Idle] = "Idle"
RequestState.Pending = 1
RequestState[RequestState.Pending] = "Pending"
RequestState.Error = 2
RequestState[RequestState.Error] = "Error"
local state = RequestState.Idle
local pendingRequest
local lastWeather
local function formatWeather(weather)
    return (((((((weather.location .. ": ") .. weather.condition) .. "\n") .. weather.temperature) .. " | Humidity ") .. weather.humidity) .. "\nWind ") .. weather.wind
end
local function setFloatText(text, color, alpha)
    ll.SetLinkPrimitiveParamsFast(LINK_THIS, {PRIM_TEXT, text, color, alpha})
end
local function updateHoverText()
    repeat
        local ____switch5 = state
        local ____cond5 = ____switch5 == RequestState.Pending
        if ____cond5 then
            setFloatText(
                "Fetching weather...",
                vector.create(1, 1, 0),
                0.8
            )
            break
        end
        ____cond5 = ____cond5 or ____switch5 == RequestState.Error
        if ____cond5 then
            setFloatText(
                "Weather: request failed\nTouch to retry",
                vector.create(1, 0.3, 0.3),
                0.8
            )
            break
        end
        do
            if lastWeather then
                setFloatText(
                    formatWeather(lastWeather),
                    vector.create(0.5, 1, 0.5),
                    1
                )
            else
                setFloatText(
                    "Touch for weather",
                    vector.create(1, 1, 1),
                    0.8
                )
            end
        end
    until true
end
local function makeGetRequest(url)
    return ll.HTTPRequest(url, {HTTP_METHOD, "GET", HTTP_MIMETYPE, "text/plain"}, "")
end
local function fetchWeather()
    if state == RequestState.Pending then
        return
    end
    local url = ((((apiUrl .. "/") .. location) .. "?format=") .. format) .. "&u"
    state = RequestState.Pending
    pendingRequest = makeGetRequest(url)
    updateHoverText()
end
local function handleResponse(status, body)
    pendingRequest = nil
    if status ~= 200 then
        state = RequestState.Error
        updateHoverText()
        return
    end
    --- Split pipe-delimited response: location|condition|temp|humidity|wind
    local parts = string.split(body, "|")
    if #parts >= 5 then
        lastWeather = {
            location = parts[1],
            condition = parts[2],
            temperature = parts[3],
            humidity = parts[4],
            wind = parts[5]
        }
        state = RequestState.Idle
    else
        state = RequestState.Error
    end
    updateHoverText()
end
LLEvents:on(
    "http_response",
    function(requestId, status, _metadata, body)
        if requestId ~= pendingRequest then
            return
        end
        handleResponse(status, body)
    end
)
LLEvents:on(
    "listen",
    function(_channel, _name, _id, message)
        repeat
            local ____switch18 = message
            local ____cond18 = ____switch18 == "weather"
            if ____cond18 then
                fetchWeather()
                break
            end
            ____cond18 = ____cond18 or ____switch18 == "status"
            if ____cond18 then
                do
                    local temp = lastWeather and lastWeather.temperature or "N/A"
                    ll.Say(chatChannel, (("State: " .. RequestState[state]) .. ", last temp: ") .. temp)
                    break
                end
            end
        until true
    end
)
LLEvents:on("touch_start", fetchWeather)
LLTimers:every(refreshInterval, fetchWeather)
updateHoverText()
fetchWeather()
ll.Listen(
    chatChannel,
    "",
    ll.GetOwner(),
    ""
)
