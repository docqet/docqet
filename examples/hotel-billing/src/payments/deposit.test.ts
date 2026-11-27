import { describe, expect, it } from "vitest";
import { balance, type Bill } from "../ledger/ledger";
import { applyDeposit } from "./deposit";

describe("applyDeposit", () => {
  // docqet:verifies rule:deposit-counts-towards-the-bill
  it("counts the deposit towards the bill", () => {
    const bill: Bill = { id: "b1", status: "open", lines: [] };
    bill.lines.push({ id: "l1", billId: "b1", businessDay: "2026-12-01", amount: 15000, description: "Room 12" });
    applyDeposit(bill, 15000, "p1", "2026-11-20");
    expect(balance(bill)).toBe(0);
  });
});
