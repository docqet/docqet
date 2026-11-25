import { describe, expect, it } from "vitest";
import { takePayment } from "../../src/payments/provider";
import { sandboxProvider, sandboxRequests } from "./sandbox";

describe("takePayment", () => {
  // docket:verifies rule:card-numbers-are-never-kept@billing
  it("sends the provider only a token for the card", async () => {
    const provider = sandboxProvider();
    await takePayment(provider, "tok_visa", 15000, "b1");
    expect(JSON.stringify(sandboxRequests(provider))).not.toMatch(/\d{13,19}/);
  });
});
