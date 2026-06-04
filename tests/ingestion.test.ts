import { describe, expect, it } from "vitest";
import { splitIntoChunks } from "@/lib/ingestion/document-ingestion-service";

describe("splitIntoChunks", () => {
  it("splits paragraph-oriented document text into bounded chunks", () => {
    const chunks = splitIntoChunks(["A".repeat(20), "B".repeat(20), "C".repeat(20)].join("\n\n"), 45);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toContain("A");
    expect(chunks[1]).toContain("C");
  });
});

