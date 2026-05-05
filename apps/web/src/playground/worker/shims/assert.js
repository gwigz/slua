// Mirror Node's `assert` module shape: callable + `.ok` / `.equal` / etc.
// Rolldown's CJS-to-ESM interop is non-deterministic: in some builds it
// inlines `module.exports` directly (so consumers call `assert(value)`), in
// others it wraps with `__importStar` (so consumers call `assert.ok(value)`).
// Exposing both forms keeps TSTL working either way.
function assert(value, message) {
  if (!value) throw new Error(message || "Assertion failed")
}

function fail(message) {
  throw new Error(message || "Assertion failed")
}

assert.ok = assert
assert.fail = fail
assert.equal = function (actual, expected, message) {
  // eslint-disable-next-line eqeqeq
  if (actual != expected) throw new Error(message || `${actual} == ${expected}`)
}
assert.strictEqual = function (actual, expected, message) {
  if (actual !== expected) throw new Error(message || `${actual} === ${expected}`)
}
assert.notEqual = function (actual, expected, message) {
  // eslint-disable-next-line eqeqeq
  if (actual == expected) throw new Error(message || `${actual} != ${expected}`)
}
assert.notStrictEqual = function (actual, expected, message) {
  if (actual === expected) throw new Error(message || `${actual} !== ${expected}`)
}

module.exports = assert
