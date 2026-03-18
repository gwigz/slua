/// <reference path="../../packages/types/index.d.ts" />

// Configuration

const config = {
  apiUrl: "https://wttr.in",
  refreshInterval: 300,
  chatChannel: 42,
  location: "San+Francisco",
}

const { apiUrl, refreshInterval, chatChannel, location } = config

// Response types

/** Interfaces describe the shape of parsed JSON */
interface CurrentWeather {
  temp_f: number
  temp_c: number
  humidity: number
  wind_mph: number
  wind_dir: string
  condition: { text: string; icon: string }
}

interface WeatherResponse {
  location: { name: string; region: string; country: string }
  current: CurrentWeather
}

// State

/** Enum for request lifecycle */
enum RequestState {
  Idle,
  Pending,
  Error,
}

let state = RequestState.Idle
let pendingRequest: uuid | undefined
let lastWeather: CurrentWeather | undefined

// Formatting

function formatWeather(weather: CurrentWeather, loc: string) {
  return `${loc}: ${weather.condition.text}
${weather.temp_f}°F (${weather.temp_c}°C)
Humidity ${weather.humidity}% | Wind ${weather.wind_mph}mph ${weather.wind_dir}`
}

function setFloatText(text: string, color: vector, alpha: number) {
  ll.SetLinkPrimitiveParamsFast(LINK_THIS, [PRIM_TEXT, text, color, alpha])
}

function updateHoverText() {
  /** Switch on state for display */
  switch (state) {
    case RequestState.Pending:
      setFloatText("Fetching weather...", new Vector(1, 1, 0), 0.8)
      break
    case RequestState.Error:
      setFloatText("Weather: request failed\nTouch to retry", new Vector(1, 0.3, 0.3), 0.8)
      break
    default:
      if (lastWeather) {
        setFloatText(formatWeather(lastWeather, location), new Vector(0.5, 1.0, 0.5), 1.0)
      } else {
        setFloatText("Touch for weather", new Vector(1, 1, 1), 0.8)
      }
  }
}

// HTTP request

function makeGetRequest(url: string) {
  return ll.HTTPRequest(url, [HTTP_METHOD, "GET", HTTP_MIMETYPE, "application/json"], "")
}

function fetchWeather() {
  if (state === RequestState.Pending) {
    return
  }

  const url = `${apiUrl}/${location}?format=j1`

  state = RequestState.Pending
  pendingRequest = makeGetRequest(url)

  updateHoverText()
}

// Response handling

function handleResponse(status: number, body: string) {
  pendingRequest = undefined

  if (status !== 200) {
    state = RequestState.Error
    updateHoverText()
    return
  }

  /** lljson.decode parses JSON into a Lua table */
  const data = lljson.decode(body) as WeatherResponse | undefined
  const current = data?.current

  if (current) {
    lastWeather = current
    state = RequestState.Idle
  } else {
    state = RequestState.Error
  }

  updateHoverText()
}

// Events

LLEvents.on("http_response", (requestId, status, _metadata, body) => {
  if (requestId !== pendingRequest) {
    return
  }

  handleResponse(status, body)
})

LLEvents.on("listen", (_channel, _name, _id, message) => {
  /** Switch on chat commands */
  switch (message) {
    case "weather":
      fetchWeather()
      break
    case "status": {
      const temp = lastWeather?.temp_f ?? "N/A"
      ll.Say(chatChannel, `State: ${RequestState[state]}, last temp: ${temp}`)
      break
    }
  }
})

LLEvents.on("touch_start", fetchWeather)
LLTimers.every(refreshInterval, fetchWeather)

// Init

updateHoverText()
fetchWeather()

ll.Listen(chatChannel, "", ll.GetOwner(), "")
