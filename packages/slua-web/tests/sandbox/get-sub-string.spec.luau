local lust = require("./utilities/lust")
local describe, it, expect = lust.describe, lust.it, lust.expect

local ll = require("../../src/sandbox").ll

describe("ll.GetSubString", function()
	describe("sanity", function()
		it("handles typical range", function()
			expect(ll.GetSubString("Hello, world!", 0, 4)).to.equal("Hello")
		end)

		it("handles negative indices", function()
			expect(ll.GetSubString("Hello, world!", -6, -1)).to.equal("world!")
		end)

		it("handles out of bounds indices", function()
			expect(ll.GetSubString("Hello, world!", 0, 100)).to.equal("Hello, world!")
		end)

		it("handles empty string", function()
			expect(ll.GetSubString("", 0, 0)).to.equal("")
		end)

		it("handles negative start index", function()
			expect(ll.GetSubString("Hello, world!", -5, 4)).to.equal("Helloorld!")
		end)

		it("handles negative end index", function()
			expect(ll.GetSubString("Hello, world!", 0, -9)).to.equal("Hello")
		end)

		it("handles non-integer indices", function()
			expect(ll.GetSubString("Hello, world!", 0.5, 4)).to.equal("Hello")
		end)

		it("handles non-integer indices", function()
			expect(ll.GetSubString("Hello, world!", 0.5, 4)).to.equal("Hello")
		end)

		it("handles end index greater than string length", function()
			expect(ll.GetSubString("Hello, world!", 0, 100)).to.equal("Hello, world!")
		end)

		it("ignores start index greater than end index", function()
			expect(ll.GetSubString("Hello, world!", 5, 4)).to.equal("Hello, world!")
		end)

		it("ignores start index greater than end index", function()
			expect(ll.GetSubString("Hello, world!", 5, 4)).to.equal("Hello, world!")
		end)

		it("ignores start index greater than end index", function()
			expect(ll.GetSubString("Hello, world!", 5, 4)).to.equal("Hello, world!")
		end)
	end)

	describe("conformance", function()
		local input = "abcdefghijklmnopqrstuvwxyz"

		local expected: { { number | string } } = {
			-- basic positive indices
			{ 0, 25, "abcdefghijklmnopqrstuvwxyz" }, -- full string
			{ 1, 24, "bcdefghijklmnopqrstuvwxy" }, -- one char from each end
			{ 0, 0, "a" }, -- single first character
			{ 25, 25, "z" }, -- single last character
			{ 0, 1, "ab" }, -- first two characters
			{ 24, 25, "yz" }, -- last two characters
			{ 1, 1, "b" }, -- single middle character

			-- negative indices
			{ -25, 25, "bcdefghijklmnopqrstuvwxyz" }, -- negative start, positive end
			{ -1, 25, "z" }, -- negative start at end
			{ -1, -1, "z" }, -- negative start and end at end
			{ -26, -1, "abcdefghijklmnopqrstuvwxyz" }, -- full string with negative indices
			{ -5, -8, "abcdefghijklmnopqrsvwxyz" }, -- overlapping negative indices
			{ -8, -5, "stuv" }, -- valid negative range
			{ -26, -26, "a" }, -- negative indices for first char
			{ -13, -13, "n" }, -- negative index for middle char

			-- edge cases and special scenarios
			{ 0, 100, "abcdefghijklmnopqrstuvwxyz" }, -- end index beyond string length
			{ -100, 25, "abcdefghijklmnopqrstuvwxyz" }, -- start index before string start
			{ 5, 4, "abcdefghijklmnopqrstuvwxyz" }, -- start > end (should return full string)
			{ 13, 12, "abcdefghijklmnopqrstuvwxyz" }, -- start > end in middle
			{ -5, -10, "abcdefghijklmnopqvwxyz" }, -- negative start > negative end
			{ 0, -100, "abcdefghijklmnopqrstuvwxyz" }, -- negative end before string start

			-- other ranges
			{ 0, 12, "abcdefghijklm" }, -- first half
			{ 13, 25, "nopqrstuvwxyz" }, -- second half
			{ 8, 17, "ijklmnopqr" }, -- middle section
			{ -18, -8, "ijklmnopqr" }, -- same middle section with negative indices
			{ 0, -14, "abcdefghijklm" }, -- first half with negative end
			{ -13, 25, "nopqrstuvwxyz" }, -- second half with negative start

			-- single character ranges
			{ 13, 13, "n" }, -- middle character
			{ -13, -13, "n" }, -- same middle character (negative)
			{ 0, 0, "a" }, -- first character
			{ -26, -26, "a" }, -- first character (negative)
			{ 25, 25, "z" }, -- last character
			{ -1, -1, "z" }, -- last character (negative)
		}

		--[[
			local tests = "{"

			for _, test in expected do
					local start, finish, value = unpack(test)

					tests = tests .. `\n  \{ {start}, {finish}, "{ll.GetSubString(input, start, finish)}" },`
			end

			ll.OwnerSay(tests .. '\n')
		]]

		for _, test in expected do
			local start, finish, value = unpack(test)

			it('returns "' .. value .. '" for ' .. start .. ", " .. finish, function()
				expect(ll.GetSubString(input, start :: number, finish :: number)).to.equal(
					value
				)
			end)
		end
	end)
end)
