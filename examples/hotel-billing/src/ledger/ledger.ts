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

// docqet:implements component:ledger rule:closed-bills-dont-change@billing
export function post(bill: Bill, line: Line): void {
  if (bill.status === "closed") {
    throw new Error(`Bill ${bill.id} is closed`);
  }
  bill.lines.push(line);
}

// docqet:implements rule:charges-are-never-changed@billing
// docqet:gap component:ledger#corrections-of-corrections-untested
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

// docqet:tradeoff component:ledger#balance-worked-out-on-read
export function balance(bill: Bill): number {
  return bill.lines.reduce((sum, line) => sum + line.amount, 0);
}
