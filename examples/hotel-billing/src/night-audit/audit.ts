import { post, type Bill } from "../ledger/ledger";

export type Stay = { guestId: string; bill: Bill; nightlyRate: number };
export type BusinessDay = { date: string; status: "open" | "closed" };

// docqet:implements rule:closed-days-dont-change@finance
export function assertDayOpen(day: BusinessDay): void {
  if (day.status === "closed") {
    throw new Error(`${day.date} is closed`);
  }
}

// Not safe to run twice yet: a second run charges every guest again.
// docqet:implements rule:one-room-charge-per-night@finance
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
