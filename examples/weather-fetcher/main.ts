/// <reference path="../../packages/types/index.d.ts" />

// Configuration

const config = {
  apiUrl: "https://wttr.in",
  refreshInterval: 300,
  chatChannel: 42,
  location: "San+Francisco",
  format: "%l|%C|%t|%h|%w",
}

const { apiUrl, refreshInterval, chatChannel, location, format } = config

// Response types

interface Weather {
  location: string
  condition: string
  temperature: string
  humidity: string
  wind: string
}

// State

/** Enum for request lifecycle */
enum RequestState {
  Idle,
  Pending,
  Error,
}

let state = RequestState.Idle
let pendingRequest: UUID | undefined
let lastWeather: Weather | undefined

// Formatting

function formatWeather(weather: Weather) {
  return `${weather.location}: ${weather.condition}
${weather.temperature} | Humidity ${weather.humidity}
Wind ${weather.wind}`
}

function setFloatText(text: string, color: Vector, alpha: number) {
  $setPrimParams(LINK_THIS).text(text, color, alpha)
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
        setFloatText(formatWeather(lastWeather), new Vector(0.5, 1.0, 0.5), 1.0)
      } else {
        setFloatText("Touch for weather", new Vector(1, 1, 1), 0.8)
      }
  }
}

// HTTP request

function makeGetRequest(url: string) {
  return ll.HTTPRequest(url, [HTTP_METHOD, "GET", HTTP_MIMETYPE, "text/plain"], "")
}

function fetchWeather() {
  if (state === RequestState.Pending) {
    return
  }

  const url = `${apiUrl}/${location}?format=${format}&u`

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

  /** Split pipe-delimited response: location|condition|temp|humidity|wind */
  const parts = body.split("|")

  if (parts.length >= 5) {
    lastWeather = {
      location: parts[0],
      condition: parts[1],
      temperature: parts[2],
      humidity: parts[3],
      wind: parts[4],
    }

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
      const temp = lastWeather?.temperature ?? "N/A"
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
