import {
    capitalize,
    formatClock,
    formatEventStart,
    formatNumber,
} from "@/src/features/emergency-coordination/format";

describe("formatNumber", () => {
    it.each([
        [0, "0"],
        [6, "6"],
        [1200, "1,200"],
        [24500, "24,500"],
        [1000000, "1,000,000"],
        [1200.6, "1,201"],
    ])("formats %s as %s", (input, expected) => {
        expect(formatNumber(input)).toBe(expected);
    });
});

describe("formatEventStart", () => {
    it("formats the supplied Sri Lanka timestamp", () => {
        expect(
            formatEventStart("2026-11-15T08:30:00+05:30"),
        ).toBe("15 Nov 2026 · 08:30");
    });

    it("converts UTC to Sri Lanka time", () => {
        expect(
            formatEventStart("2026-11-15T03:00:00Z"),
        ).toBe("15 Nov 2026 · 08:30");
    });

    it("handles a date rollover after timezone conversion", () => {
        expect(
            formatEventStart("2026-11-15T22:45:00Z"),
        ).toBe("16 Nov 2026 · 04:15");
    });

    it("returns a placeholder for an invalid date", () => {
        expect(formatEventStart("invalid-date")).toBe("—");
    });
});

describe("formatClock", () => {
    it("formats the operational update time", () => {
        expect(
            formatClock("2026-11-15T14:20:00+05:30"),
        ).toBe("14:20");
    });

    it("pads single-digit hours and minutes", () => {
        expect(
            formatClock("2026-11-15T01:05:00+05:30"),
        ).toBe("01:05");
    });

    it("returns a placeholder for an invalid date", () => {
        expect(formatClock("invalid-date")).toBe("--:--");
    });
});

describe("capitalize", () => {
    it("capitalizes the first letter", () => {
        expect(capitalize("flood")).toBe("Flood");
    });

    it("handles an empty string", () => {
        expect(capitalize("")).toBe("");
    });

    it("leaves an already capitalized value unchanged", () => {
        expect(capitalize("High")).toBe("High");
    });
});
