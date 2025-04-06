---
title: Resources - HTTP
category: Resources
tags: ["resources", "callbacks", "http"]
---

# Fetch <Badge type="info" text="work in progress" />

A minimal callback based HTTP client interface for making HTTP requests in scripts. This provides a callback-based interface around the built-in [`ll.HTTPRequest`](https://wiki.secondlife.com/wiki/LlHTTPRequest) API.

## Implementation

This snippet comes in two parts, the function itself and the event handler.

### Fetch Function

::: details Unhandled errors in this example that you should be aware of

1. `ll.HTTPRequest` can script error if the URL is invalid
2. `lljson.encode` can script error if `body` cannot be converted to JSON

:::

```luau
type FetchCallback = (status: string, response: string, metadata: { number }) -> ()

-- where we store callbacks, till the `http_response` event happens
local fetch_callbacks = {} :: { [uuid]: FetchCallback }

--- @param params -- see https://wiki.secondlife.com/wiki/LlHTTPRequest
--- @param body -- can be a string or a table (will be encoded to JSON)
local function fetch(
	method: "GET" | "POST" | "PUT" | "DELETE",
	url: string,
	params: { number | string | boolean }?,
	body: string | { [string | number]: any }?,
	callback: FetchCallback?
)
	local parameters = params or {}

	table.insert(parameters, HTTP_EXTENDED_ERROR)
	table.insert(parameters, true)

	table.insert(parameters, HTTP_METHOD)
	table.insert(parameters, method)

	table.insert(parameters, HTTP_ACCEPT)
	table.insert(parameters, "application/json")

	local request = body or ""

	-- automatically handle JSON
	if type(body) == "table" then
		request = lljson.encode(body)

		table.insert(parameters, HTTP_MIMETYPE)
		table.insert(parameters, "application/json")
	end

	local id = ll.HTTPRequest(url, parameters, request)

	if callback then
		fetch_callbacks[id] = callback
	end

	return id
end
```

### Event Handler

The following is snippet also required (for at least an early exit) in your global [`http_response`](https://wiki.secondlife.com/wiki/Http_response) event handler.

```luau
function http_response(id: uuid, status: number, metadata: { number }, body: string)
	local callback = fetch_callbacks[id]

	if callback then
		callback(status, body, metadata)

		-- free up that precious memory! :3
		fetch_callbacks[id] = nil
	end
end
```

This may change later, as we are expecting changes to the events API.

## Example Usage

### `GET`

Simple request to a public API:

```luau
local url = `https://pokeapi.co/api/v2/pokemon?limit=1&offset={math.random(0, 99)}`

fetch("GET", url, nil, nil, function(status, response)
	local ok, data = pcall(lljson.decode, response)

	if status == 200 and ok then
		ll.OwnerSay(`WOW, YOU FOUND A {data.results[1].name:upper()}!`)
	else
		ll.OwnerSay("Something went wrong... " .. response)
	end
end)
```

::: details Custom authorization header

Request with a custom authorization header, using [`ll.HTTPRequest`](https://wiki.secondlife.com/wiki/LlHTTPRequest) parameters.

```luau
-- TODO: add a valid example URL here
local url = "http://localhost:3000"

local params = {
	HTTP_CUSTOM_HEADER, "Authorization: Bearer token123"
}

fetch("GET", url, params, nil, function(status, response)
	ll.OwnerSay(`[{status}]: {response}`)
end)
```

:::

::: details More useful `ll.HTTPRequest` parameters

| Parameters                      | Description                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `HTTP_BODY_MAXLENGTH`, `number` | Sets the maximum (UTF-8 encoded) byte length of the HTTP response body, by default this is `2048` |
| `HTTP_ACCEPT`, `string`         | Note this is forced to `application/json` in the implementation                                   |

https://wiki.secondlife.com/wiki/LlHTTPRequest

:::

### `POST`

JSON requests are automatically transformed, and do not require a `HTTP_MIMETYPE`.

```luau
-- TODO: add a valid example URL here
local url = "http://localhost:3000"
local params = { HTTP_CUSTOM_HEADER, "Authorization", "Bearer token123" }

-- [!code highlight:4]
local request = {
	id = "e760b472-baf4-43c2-97f9-e36bbc5ee3f6",
	username = "nya"
}

-- [!code word:request]
fetch("POST", url, params, request, function(status, response)
	local ok, data = pcall(lljson.decode, response)

	if status < 300 and ok then
		ll.OwnerSay("Created: " .. tostring(data.id))
	else
		ll.OwnerSay("Failed: " .. response)
	end
end)
```

::: details Plain text

Plain text can just be posted as normal.

```luau
-- TODO: add a valid example URL here
local url = "http://localhost:3000"

-- [!code highlight]
local request = "My plain text"

-- [!code word:request:1]
fetch("POST", url, params, request, function(status, response)
	local ok, data = pcall(lljson.decode, response)

	if status < 300 and ok then
		ll.OwnerSay("Post successful: " .. data)
	else
		ll.OwnerSay("Post failed: " .. response)
	end
end)
```

:::

::: details Form data

Form data, and similar requests need to be manually adjusted for using [`ll.HTTPRequest`](https://wiki.secondlife.com/wiki/LlHTTPRequest) parameters.

```luau
-- TODO: add a valid example URL here
local url = "http://localhost:3000"

local params = {
	-- [!code highlight:2]
	HTTP_MIMETYPE,
	"application/x-www-form-urlencoded",
}

local name = "nya"
local message = "Hello, world!"

-- [!code highlight]
local request = `name={ll.EscapeURL(name)}&message={ll.EscapeURL(message)}`

-- [!code word:request:1]
fetch("POST", url, params, request, function(status, response)
	local ok, data = pcall(lljson.decode, response)

	if status < 300 and ok then
		ll.OwnerSay("Post successful: " .. data)
	else
		ll.OwnerSay("Post failed: " .. response)
	end
end)
```

:::

## Tips

### Maximum Response Length

Will add some info about how you could use `HTTP_BODY_MAXLENGTH` here later, and why the default is `2048`. Plus some info on i.e. `Range: bytes=0-1023` headers.

### Extended Errors

Second Life can provide [extended errors](https://wiki.secondlife.com/wiki/LlHTTPRequest#:~:text=When%20the%20HTTP_EXTENDED_ERROR%20parameter%20is%20TRUE) as JSON response for scenarios where the region blocks your request.

Without this, your callbacks will not be fired when making requests that don't meet the criteria or limits Linden Lab have applied to the [`ll.HTTPRequest`](https://wiki.secondlife.com/wiki/LlHTTPRequest) API.

::: details Extended error codes and their descriptions

| Error              | Status | Description                                                  |
| ------------------ | ------ | ------------------------------------------------------------ |
| Method Not Allowed | 405    | HTTP method specified is not supported                       |
| Unsupported Type   | 415    | Mimetype specified is not supported                          |
| Enhance Your Calm  | 420    | HTTP requests temporarily throttled for this object or owner |
| HTTP Unavailable   | 470    | HTTP and/or HTTPS is disabled in this region                 |
| Invalid URL        | 471    | Invalid URL                                                  |
| Parameter Error    | 472    | Invalid parameters                                           |
| Illegal Header     | 473    | A custom header is not allowed                               |
| Too Many Headers   | 474    | Too many custom headers have been specified                  |

:::

::: details How to remove extended errors

If you don't want the region giving you response codes or content when a client occurs, you can optionally just "hide" this functionality by removing the parameter.

```luau
local parameters = params or {}

table.insert(parameters, HTTP_EXTENDED_ERROR) -- [!code --]
table.insert(parameters, true) -- [!code --]

table.insert(parameters, HTTP_METHOD)
table.insert(parameters, method)
```

Note that `http_response` is not called in the event of these errors occurring. So, if you do remove extended errors, it's recommended to clear `fetch_callbacks` periodically.

:::

### Alternatives

Will add some text here later about the limits, and alternatives like `ll.RequestURL` and `http_request`.
