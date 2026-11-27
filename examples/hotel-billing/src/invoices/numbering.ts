// Called only when an invoice is saved, never for a draft, so a discarded
// draft doesn't skip a number.
// docqet:implements rule:invoice-numbers-run-in-sequence
export function nextInvoiceNumber(lastNumber: number | null): number {
  return (lastNumber ?? 0) + 1;
}
