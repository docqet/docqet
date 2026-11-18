import { describe, expect, it } from "vitest";
import { nextInvoiceNumber } from "./numbering";

describe("nextInvoiceNumber", () => {
  // docket:verifies rule:invoices/invoice-numbers-run-in-sequence
  it("follows the last invoice's number", () => {
    expect(nextInvoiceNumber(41)).toBe(42);
  });

  it("starts at 1", () => {
    expect(nextInvoiceNumber(null)).toBe(1);
  });
});
