// Node's assert exports the function directly. Must be CJS so Rolldown's
// __toCommonJS returns the function itself, not { default: fn }.
module.exports = function assert(value, message) {
  if (!value) throw new Error(message || "Assertion failed")
}
