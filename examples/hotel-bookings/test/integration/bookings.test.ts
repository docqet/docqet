import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Pool } from "pg";
import { saveBooking } from "../../src/booking/repository";
import { testDatabase } from "./database";

let db: Pool;
beforeAll(async () => (db = await testDatabase()));
afterAll(() => db.end());

describe("saveBooking", () => {
  // docket:verifies rule:no-double-booking@guest-stays
  it("is refused by the database when the room is taken that night", async () => {
    await saveBooking(db, { id: "b1", roomId: "12", stay: { checkIn: "2026-12-01", checkOut: "2026-12-04" }, status: "confirmed" });
    await expect(
      saveBooking(db, { id: "b2", roomId: "12", stay: { checkIn: "2026-12-03", checkOut: "2026-12-05" }, status: "confirmed" }),
    ).rejects.toThrow(/exclusion constraint/);
  });
});
