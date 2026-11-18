import { post, type Bill } from "../ledger/ledger";

export type Stay = { guestId: string; bill: Bill; nightlyRate: number };
export type BusinessDay = { date: string; status: "open" | "closed" };

// docket:implements rule:night-audit/closed-days-dont-change
export function assertDayOpen(day: BusinessDay): void {
  if (day.status === "closed") {
    throw new Error(`${day.date} is closed`);
  }
}

// Not safe to run twice yet: a second run charges every guest again.
// docket:implements rule:night-audit/one-room-charge-per-night
export function runNightAudit(day: BusinessDay, inHouse: Stay[]): void {
  assertDayOpen(day);
  for (const stay of inHouse) {
    post(stay.bill, {
      id: `${stay.bill.id}:${day.date}:room`,
      billId: stay.bill.id,
      businessDay: day.date,
      amount: stay.nightlyRate,
      description: `Room, night of ${day.date}`,
    });
  }
  day.status = "closed";
}
