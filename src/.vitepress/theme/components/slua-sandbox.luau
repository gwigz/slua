internal = { name = "Object", description = "" }

internal.log = function(type: number, message: string)
	print('#REPL#', os.time(), os.clock(), type, internal.name, message)
end

DEBUG_CHANNEL = 2147483647

ll = {}

ll.GetOwner = function()
	return "00000000-0000-0000-0000-000000000000"
end

ll.SetObjectName = function(name: string)
	-- TODO: match length and character limits
	internal.name = name:gsub("[^%w%s]", "")
end

ll.SetObjectDesc = function(description: string)
	-- TODO: match length and character limits
	internal.description = description:gsub("[^%w%s]", "")
end

ll.OwnerSay = function(message: string)
	internal.log(2, message)
end

ll.Whisper = function(channel: number, message: string)
	if channel == 0 then
		internal.log(3, message)
	elseif channel == DEBUG_CHANNEL then
		internal.log(1, message)
	end
end

ll.Say = function(channel: number, message: string)
	if channel == 0 then
		internal.log(4, message)
	elseif channel == DEBUG_CHANNEL then
		internal.log(1, message)
	end
end

ll.Shout = function(channel: number, message: string)
	if channel == 0 then
		internal.log(5, message)
	elseif channel == DEBUG_CHANNEL then
		internal.log(1, message)
	end
end

ll.RegionSayTo = function(id: uuid | string, channel: number, message: string)
	if id == ll.GetOwner() then
		internal.log(6, message)
	end
end

ll.RegionSay = function(channel: number, message: string)
	if channel == DEBUG_CHANNEL then
		internal.log(1, message)
	end
end
