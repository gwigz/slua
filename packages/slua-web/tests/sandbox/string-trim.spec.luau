local lust = require("./utilities/lust")
local describe, it, expect = lust.describe, lust.it, lust.expect

local ll = require("../../src/sandbox").ll

local STRING_TRIM_HEAD = 1
local STRING_TRIM_TAIL = 2
local STRING_TRIM = 3

describe("ll.StringTrim", function()
	describe("sanity", function()
		describe("STRING_TRIM", function()
			it("trims the whole string", function()
				expect(ll.StringTrim("    Hello, world!      ", STRING_TRIM)).to.equal(
					"Hello, world!"
				)
			end)

			it("handles tabs", function()
				expect(ll.StringTrim("\t\tHello, world!\t\t", STRING_TRIM)).to.equal(
					"Hello, world!"
				)
			end)

			it("handles new lines", function()
				expect(ll.StringTrim("\n\nHello, world!\n\n", STRING_TRIM)).to.equal(
					"Hello, world!"
				)
			end)

			it("handles line feeds", function()
				expect(ll.StringTrim("\r\n\r\nHello, world!\r\n\r\n", STRING_TRIM)).to.equal(
					"Hello, world!"
				)
			end)

			it("handles carriage returns", function()
				expect(ll.StringTrim("\r\rHello, world!\r\r", STRING_TRIM)).to.equal(
					"Hello, world!"
				)
			end)
		end)

		describe("STRING_TRIM_HEAD", function()
			it("trims the head of the string", function()
				expect(ll.StringTrim("    Hello, world!      ", STRING_TRIM_HEAD)).to.equal(
					"Hello, world!      "
				)
			end)
		end)

		describe("STRING_TRIM_TAIL", function()
			it("trims the tail of the string", function()
				expect(ll.StringTrim("    Hello, world!      ", STRING_TRIM_TAIL)).to.equal(
					"    Hello, world!"
				)
			end)
		end)
	end)

	describe("conformance", function()
		-- TODO: the expected values here aren't from LSL yet
		local expects: { { string | number } } = {
			-- basic cases
			{ "Hello, world!", STRING_TRIM, "Hello, world!" },
			{ "Hello, world!", STRING_TRIM_HEAD, "Hello, world!" },
			{ "Hello, world!", STRING_TRIM_TAIL, "Hello, world!" },

			-- leading whitespace
			{ "   Hello", STRING_TRIM, "Hello" },
			{ "   Hello", STRING_TRIM_HEAD, "Hello" },
			{ "   Hello", STRING_TRIM_TAIL, "   Hello" },

			-- trailing whitespace
			{ "Hello   ", STRING_TRIM, "Hello" },
			{ "Hello   ", STRING_TRIM_HEAD, "Hello   " },
			{ "Hello   ", STRING_TRIM_TAIL, "Hello" },

			-- both sides whitespace
			{ "   Hello   ", STRING_TRIM, "Hello" },
			{ "   Hello   ", STRING_TRIM_HEAD, "Hello   " },
			{ "   Hello   ", STRING_TRIM_TAIL, "   Hello" },

			-- mixed whitespace
			{ "\t \n Hello \t \n", STRING_TRIM, "Hello" },
			{ "\t \n Hello \t \n", STRING_TRIM_HEAD, "Hello \t \n" },
			{ "\t \n Hello \t \n", STRING_TRIM_TAIL, "\t \n Hello" },

			-- empty string
			{ "", STRING_TRIM, "" },
			{ "", STRING_TRIM_HEAD, "" },
			{ "", STRING_TRIM_TAIL, "" },

			-- whitespace only
			{ "   ", STRING_TRIM, "" },
			{ "   ", STRING_TRIM_HEAD, "" },
			{ "   ", STRING_TRIM_TAIL, "" },

			-- mixed whitespace only
			{ "\t \n \r", STRING_TRIM, "" },
			{ "\t \n \r", STRING_TRIM_HEAD, "" },
			{ "\t \n \r", STRING_TRIM_TAIL, "" },

			-- single character
			{ "a", STRING_TRIM, "a" },
			{ "a", STRING_TRIM_HEAD, "a" },
			{ "a", STRING_TRIM_TAIL, "a" },

			-- single character with whitespace
			{ " a ", STRING_TRIM, "a" },
			{ " a ", STRING_TRIM_HEAD, "a " },
			{ " a ", STRING_TRIM_TAIL, " a" },

			-- spaces between words
			{ "  Hello  World  ", STRING_TRIM, "Hello  World" },
			{ "  Hello  World  ", STRING_TRIM_HEAD, "Hello  World  " },
			{ "  Hello  World  ", STRING_TRIM_TAIL, "  Hello  World" },

			-- special characters
			{ "  !@#$%^&*()  ", STRING_TRIM, "!@#$%^&*()" },
			{ "  !@#$%^&*()  ", STRING_TRIM_HEAD, "!@#$%^&*()  " },
			{ "  !@#$%^&*()  ", STRING_TRIM_TAIL, "  !@#$%^&*()" },

			-- emoji characters
			{
				"  \u{1F680} Hello \u{1F30D}  ",
				STRING_TRIM,
				"\u{1F680} Hello \u{1F30D}",
			},
			{
				"  \u{1F680} Hello \u{1F30D}  ",
				STRING_TRIM_HEAD,
				"\u{1F680} Hello \u{1F30D}  ",
			},
			{
				"  \u{1F680} Hello \u{1F30D}  ",
				STRING_TRIM_TAIL,
				"  \u{1F680} Hello \u{1F30D}",
			},

			-- non-breaking space (U+00A0)
			{ "\u{00A0}Hello\u{00A0}", STRING_TRIM, "\u{00A0}Hello\u{00A0}" },
			{ "\u{00A0}Hello\u{00A0}", STRING_TRIM_HEAD, "\u{00A0}Hello\u{00A0}" },
			{ "\u{00A0}Hello\u{00A0}", STRING_TRIM_TAIL, "\u{00A0}Hello\u{00A0}" },

			-- zero-width space (U+200B)
			{ "\u{200B}Hello\u{200B}", STRING_TRIM, "\u{200B}Hello\u{200B}" },
			{ "\u{200B}Hello\u{200B}", STRING_TRIM_HEAD, "\u{200B}Hello\u{200B}" },
			{ "\u{200B}Hello\u{200B}", STRING_TRIM_TAIL, "\u{200B}Hello\u{200B}" },

			-- thin space (U+2009)
			{ "\u{2009}Hello\u{2009}", STRING_TRIM, "\u{2009}Hello\u{2009}" },
			{ "\u{2009}Hello\u{2009}", STRING_TRIM_HEAD, "\u{2009}Hello\u{2009}" },
			{ "\u{2009}Hello\u{2009}", STRING_TRIM_TAIL, "\u{2009}Hello\u{2009}" },

			-- mixed unicode whitespace
			{
				"\u{00A0}\u{200B}\u{2009}Hello\u{00A0}\u{200B}\u{2009}",
				STRING_TRIM,
				"\u{00A0}\u{200B}\u{2009}Hello\u{00A0}\u{200B}\u{2009}",
			},
			{
				"\u{00A0}\u{200B}\u{2009}Hello\u{00A0}\u{200B}\u{2009}",
				STRING_TRIM_HEAD,
				"\u{00A0}\u{200B}\u{2009}Hello\u{00A0}\u{200B}\u{2009}",
			},
			{
				"\u{00A0}\u{200B}\u{2009}Hello\u{00A0}\u{200B}\u{2009}",
				STRING_TRIM_TAIL,
				"\u{00A0}\u{200B}\u{2009}Hello\u{00A0}\u{200B}\u{2009}",
			},

			-- Mixed standard and Unicode whitespace
			{
				" \t\u{00A0}\nHello \t\u{00A0}\n",
				STRING_TRIM,
				"\u{00A0}\nHello \t\u{00A0}",
			},
			{
				" \t\u{00A0}\nHello \t\u{00A0}\n",
				STRING_TRIM_HEAD,
				"\u{00A0}\nHello \t\u{00A0}\n",
			},
			{
				" \t\u{00A0}\nHello \t\u{00A0}\n",
				STRING_TRIM_TAIL,
				" \t\u{00A0}\nHello \t\u{00A0}",
			},
		}

		local modes = {
			"STRING_TRIM_HEAD",
			"STRING_TRIM_TAIL",
			"STRING_TRIM",
		}

		local function escape(str: any)
			if type(str) ~= "string" then
				return str
			end

			local result = ""

			for _, codepoint in utf8.codes(str) do
				if codepoint >= 32 and codepoint <= 126 then
					result = result .. utf8.char(codepoint)
				elseif codepoint == 9 then
					result = result .. "\\t"
				elseif codepoint == 10 then
					result = result .. "\\n"
				elseif codepoint == 13 then
					result = result .. "\\r"
				else
					result = result .. string.format("\\u{%04X}", codepoint)
				end
			end

			return result
		end

		--[[

		for _, test in expects do
			local input, mode = unpack(test)

			ll.OwnerSay(`\{ "{escape(input)}", {modes[mode]}, "{escape(ll.StringTrim(input, mode))}" },`)
		end

		]]

		for _, test in expects do
			local input, mode, expected = unpack(test)

			it(
				`returns "{escape(expected)}" when called with "{escape(input)}", {modes[mode :: number]}`,
				function()
					expect(ll.StringTrim(input :: string, mode :: number)).to.equal(
						expected
					)
				end
			)
		end
	end)
end)
