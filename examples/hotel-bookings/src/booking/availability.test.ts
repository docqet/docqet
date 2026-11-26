import { describe, expect, it } from "vitest";
import { assertRoomFree } from "./availability";
import type { Booking } from "./stay";

const booked: Booking = {
  id: "b1",
  roomId: "12",
  stay: { checkIn: "2026-12-01", checkOut: "2026-12-04" },
  status: "confirmed",
};

describe("assertRoomFree", () => {
  // docqet:verifies rule:no-double-booking@guest-stays
  it("refuses a room that's booked for one of the nights", () => {
    expect(() => assertRoomFree("12", { checkIn: "2026-12-03", checkOut: "2026-12-05" }, [booked])).toThrow();
  });

  it("ignores another room's bookings", () => {
    expect(() => assertRoomFree("14", { checkIn: "2026-12-03", checkOut: "2026-12-05" }, [booked])).not.toThrow();
  });
});
