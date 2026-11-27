import { balance, type Bill } from "../ledger/ledger";

export type CompanyAccount = { id: string; creditLimit: number; owed: number; guests: string[] };

// docqet:implements rule:credit-limit
export function assertWithinLimit(account: CompanyAccount, amount: number): void {
  if (account.owed + amount > account.creditLimit) {
    throw new Error(`That would take ${account.id} over its credit limit`);
  }
}

// docqet:implements rule:only-named-guests
export function assertNamedGuest(account: CompanyAccount, guestId: string): void {
  if (!account.guests.includes(guestId)) {
    throw new Error(`${account.id} doesn't pay for this guest's stays`);
  }
}

export function moveToCompany(bill: Bill, guestId: string, account: CompanyAccount): void {
  const amount = balance(bill);
  assertNamedGuest(account, guestId);
  assertWithinLimit(account, amount);
  account.owed += amount;
  bill.status = "closed";
}
