// Amounts are in cents, so they add up exactly.
export type Line = {
  id: string;
  billId: string;
  businessDay: string;
  amount: number;
  description: string;
  corrects?: string;
};

export type Bill = { id: string; status: "open" | "closed"; lines: Line[] };

// docket:implements component:ledger rule:bills/closed-bills-dont-change
export function post(bill: Bill, line: Line): void {
  if (bill.status === "closed") {
    throw new Error(`Bill ${bill.id} is closed`);
  }
  bill.lines.push(line);
}

// docket:implements rule:bills/charges-are-never-changed
// docket:gap component:ledger#corrections-of-corrections-untested
export function correct(bill: Bill, line: Line, id: string, businessDay: string): void {
  post(bill, {
    id,
    billId: bill.id,
    businessDay,
    amount: -line.amount,
    description: `Correction: ${line.description}`,
    corrects: line.id,
  });
}

// docket:tradeoff component:ledger#balance-worked-out-on-read
export function balance(bill: Bill): number {
  return bill.lines.reduce((sum, line) => sum + line.amount, 0);
}
