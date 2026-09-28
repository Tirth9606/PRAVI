import { describe, it, expect } from "vitest";
import { toCSV } from "@/lib/csv";
import { enumLabel } from "@/locales/enum-labels";
import { getDictionary, LOCALES } from "@/locales";

describe("CSV export (spec §31)", () => {
  it("escapes commas, quotes and newlines per RFC 4180", () => {
    const csv = toCSV(["a", "b"], [["hello, world", 'quote"x']]);
    expect(csv).toContain('"hello, world"');
    expect(csv).toContain('"quote""x"');
  });
  it("renders null/undefined as empty cells", () => {
    const csv = toCSV(["a", "b", "c"], [[null, undefined, 0]]);
    expect(csv.split("\r\n")[1]).toBe(",,0");
  });
});

describe("Multilingual labels (spec §32) — DB enums stay English", () => {
  it("translates a status per locale without changing the stored value", () => {
    expect(enumLabel("UNDER_CONSTRUCTION", "en")).toBe("Under Construction");
    expect(enumLabel("UNDER_CONSTRUCTION", "hi")).toBe("निर्माणाधीन");
    expect(enumLabel("UNDER_CONSTRUCTION", "gu")).toBe("બાંધકામ હેઠળ");
  });
  it("falls back to a humanized English label for unmapped values", () => {
    expect(enumLabel("SOME_NEW_VALUE", "hi")).toBe("Some New Value");
  });
  it("every locale exposes the same dictionary key structure", () => {
    const keysOf = (o: object, prefix = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        typeof v === "object" && v !== null ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`],
      );
    const en = keysOf(getDictionary("en")).sort();
    for (const loc of LOCALES) {
      expect(keysOf(getDictionary(loc)).sort()).toEqual(en);
    }
  });
});
