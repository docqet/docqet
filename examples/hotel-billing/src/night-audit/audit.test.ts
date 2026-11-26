import { describe, expect, it } from "vitest";
import type { Bill } from "../ledger/ledger";
import { runNightAudit } from "./audit";

describe("runNightAudit", () => {
  // docqet:verifies rule:one-room-charge-per-night@finance
  it("charges each guest in the hotel for the night", () => {
    const bills: Bill[] = [
      { id: "b1", status: "open", lines: [] },
      { id: "b2", status: "open", lines: [] },
    ];
    runNightAudit(
      { date: "2026-12-01", status: "open" },
      bills.map((bill, i) => ({ guestId: `g${i}`, bill, nightlyRate: 15000 })),
    );
    expect(bills.map((b) => b.lines.length)).toEqual([1, 1]);
  });
});
