import { post, type Bill } from "../ledger/ledger";

// docket:implements rule:payments/deposit-is-the-first-night
export function depositAmount(firstNightRate: number, firstNightCityTax: number): number {
  return firstNightRate + firstNightCityTax;
}

// docket:implements rule:payments/deposit-counts-towards-the-bill
export function applyDeposit(bill: Bill, amount: number, paymentId: string, businessDay: string): void {
  post(bill, { id: paymentId, billId: bill.id, businessDay, amount: -amount, description: "Deposit" });
}
