local lust = require("./utilities/lust")
local describe, it, expect = lust.describe, lust.it, lust.expect

local uuid = require("../../src/sandbox").uuid

describe("uuid", function()
	describe("sanity", function()
		it("formats strings correctly", function()
			expect(tostring(uuid("30865e22-55c0-4792-a898-4abf64e215d2"))).to.equal(
				"30865e22-55c0-4792-a898-4abf64e215d2"
			)

			expect(tostring(uuid("test"))).to.equal("test")
		end)

		it("returns true when calling istruthy", function()
			expect(uuid("30865e22-55c0-4792-a898-4abf64e215d2").istruthy).to.equal(
				true
			)

			expect(uuid("test").istruthy).to.equal(true)
		end)

		describe("NULL_KEY", function()
			it("returns true when calling istruthy", function()
				expect(uuid("00000000-0000-0000-0000-000000000000").istruthy).to.equal(
					false
				)
			end)
		end)
	end)
end)
