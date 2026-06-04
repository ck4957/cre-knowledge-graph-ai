import { describe, expect, it } from "vitest";
import { isActive } from "@/lib/temporal/is-active";

describe("isActive", () => {
  it("treats facts as active inside their validity window", () => {
    expect(
      isActive(
        {
          validFrom: "2024-01-01",
          validTo: "2029-12-31"
        },
        new Date("2026-06-03")
      )
    ).toBe(true);
  });

  it("treats facts as inactive after their validity window", () => {
    expect(
      isActive(
        {
          validFrom: "2024-01-01",
          validTo: "2025-12-31"
        },
        new Date("2026-06-03")
      )
    ).toBe(false);
  });

  it("supports open-ended facts", () => {
    expect(isActive({ validFrom: "2026-04-01" }, new Date("2026-06-03"))).toBe(true);
  });
});

