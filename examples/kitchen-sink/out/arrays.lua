--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__ArrayMap(self, callbackfn, thisArg)
    local result = {}
    for i = 1, #self do
        result[i] = callbackfn(thisArg, self[i], i - 1, self)
    end
    return result
end

local function __TS__ArrayFilter(self, callbackfn, thisArg)
    local result = {}
    local len = 0
    for i = 1, #self do
        if callbackfn(thisArg, self[i], i - 1, self) then
            len = len + 1
            result[len] = self[i]
        end
    end
    return result
end

local function __TS__ArrayFind(self, predicate, thisArg)
    for i = 1, #self do
        local elem = self[i]
        if predicate(thisArg, elem, i - 1, self) then
            return elem
        end
    end
    return nil
end

local function __TS__CountVarargs(...)
    return select("#", ...)
end

local function __TS__ArrayReduce(self, callbackFn, ...)
    local len = #self
    local k = 0
    local accumulator = nil
    if __TS__CountVarargs(...) ~= 0 then
        accumulator = ...
    elseif len > 0 then
        accumulator = self[1]
        k = 1
    else
        error("Reduce of empty array with no initial value", 0)
    end
    for i = k + 1, len do
        accumulator = callbackFn(
            nil,
            accumulator,
            self[i],
            i - 1,
            self
        )
    end
    return accumulator
end

local function __TS__ArrayIncludes(self, searchElement, fromIndex)
    if fromIndex == nil then
        fromIndex = 0
    end
    local len = #self
    local k = fromIndex
    if fromIndex < 0 then
        k = len + fromIndex
    end
    if k < 0 then
        k = 0
    end
    for i = k + 1, len do
        if self[i] == searchElement then
            return true
        end
    end
    return false
end

local function __TS__SparseArrayNew(...)
    local sparseArray = {...}
    sparseArray.sparseLength = __TS__CountVarargs(...)
    return sparseArray
end

local function __TS__SparseArrayPush(sparseArray, ...)
    local args = {...}
    local argsLen = __TS__CountVarargs(...)
    local listLen = sparseArray.sparseLength
    for i = 1, argsLen do
        sparseArray[listLen + i] = args[i]
    end
    sparseArray.sparseLength = listLen + argsLen
end

local function __TS__SparseArraySpread(sparseArray)
    local _unpack = unpack or table.unpack
    return _unpack(sparseArray, 1, sparseArray.sparseLength)
end

local function __TS__ArraySlice(self, first, last)
    local len = #self
    first = first or 0
    if first < 0 then
        first = len + first
        if first < 0 then
            first = 0
        end
    else
        if first > len then
            first = len
        end
    end
    last = last or len
    if last < 0 then
        last = len + last
        if last < 0 then
            last = 0
        end
    else
        if last > len then
            last = len
        end
    end
    local out = {}
    first = first + 1
    last = last + 1
    local n = 1
    while first < last do
        out[n] = self[first]
        first = first + 1
        n = n + 1
    end
    return out
end
-- End of Lua Library inline imports
local ____exports = {}
--- Array.map -- transform each element
local positions = {
    vector.create(0, 0, 0),
    vector.create(1, 2, 3),
    vector.create(10, 20, 30)
}
local doubled = __TS__ArrayMap(
    positions,
    function(____, v) return v * 2 end
)
--- Array.filter -- keep elements matching a predicate
local nearby = __TS__ArrayFilter(
    positions,
    function(____, v) return vector.magnitude(v) < 50 end
)
--- Array.find -- get the first match
local origin = __TS__ArrayFind(
    positions,
    function(____, v) return vector.magnitude(v) == 0 end
)
--- Array.reduce -- accumulate a result
local totalMagnitude = __TS__ArrayReduce(
    positions,
    function(____, sum, v) return sum + vector.magnitude(v) end,
    0
)
--- Array.includes -- check membership
local channels = {0, 1, 42, 100}
local hasDebugChannel = __TS__ArrayIncludes(channels, 42)
--- Array spread -- combine arrays
local extra = {vector.create(5, 5, 5)}
local ____array_0 = __TS__SparseArrayNew(table.unpack(positions))
__TS__SparseArrayPush(
    ____array_0,
    table.unpack(extra)
)
local all = {__TS__SparseArraySpread(____array_0)}
for ____, pos in ipairs(all) do
    ll.Say(
        0,
        tostring(pos)
    )
end
local first = positions[1]
local second = positions[2]
local rest = __TS__ArraySlice(positions, 2)
____exports.doubled = doubled
____exports.nearby = nearby
____exports.origin = origin
____exports.totalMagnitude = totalMagnitude
____exports.hasDebugChannel = hasDebugChannel
____exports.first = first
return ____exports
