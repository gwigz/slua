---
title: Resources - Prim Params Batching
category: Resources
tags: ["resources", "slppf"]
---

# Prim Params Batching

This minimal snippet allows for much easier batching of link prim params, by grouping sets of [`ll.SetLinkPrimitiveParamsFast`](https://wiki.secondlife.com/wiki/LlSetPrimitiveParams), and "committing" them once you're done looping.

::: details Why would you do this?

You can just call `ll.SetLinkPrimitiveParamsFast` in sequence, but this has two downsides:

- It's slower to repetitively call
- People will see the changes applied in sequence, rather than all at once

:::

## Implementation

```luau
local link_params = {}
local link_params_link_target = 2

local function insert_params(link_target: number, ...)
	-- update the current PRIM_LINK_TARGET if it differs
	if link_params_link_target ~= link_target then
		link_params_link_target = link_target

		table.insert(link_params, PRIM_LINK_TARGET)
		table.insert(link_params, link_target)
	end

	-- for each of the remaining params, insert them into `link_params`
	for i = 1, select("#", ...) do
		link_params[#link_params + 1] = select(i, ...)
	end
end

local function commit_params()
	if #link_params == 0 then
		return
	end

	ll.SetLinkPrimitiveParamsFast(2, link_params)

	link_params = {}
	link_params_link_target = 2
end
```

## Example Usage

Link a bunch of cubes together give this a try.

```luau
-- calculate the number of rows and cells we can order the link set in
local prims = ll.GetNumberOfPrims()
local rows = math.ceil(math.sqrt(prims))
local cols = math.ceil(prims / rows)

-- for each link after the root prim (so we start at 2)
-- re-position, and add some text
for prim = 2, prims do
	local x = (i - 1) % cols
	local y = (i - 1) // cols
	local z = math.sin(os.clock() * 0.1 + i)

	insert_params(
		prim,
		PRIM_POSITION, vector.create(x, y, z),
		PRIM_TEXT, "SLPPF\n" .. tostring(prim), vector.one, 1.0
	)
end

-- apply all the recently inserted params
commit_params()
```
