const MAX_TAXED_NIGHTS = 7;

// docqet:implements rule:city-tax-stops-after-seven-nights@billing
export function taxedNights(nights: string[]): string[] {
  return nights.slice(0, MAX_TAXED_NIGHTS);
}

// Every guest is taxed: guests' ages aren't recorded yet, so children are
// corrected by hand.
// docqet:implements rule:city-tax-per-guest-night@billing
export function cityTax(guests: number, nights: string[], ratePerGuestNight: number): { night: string; amount: number }[] {
  return taxedNights(nights).map((night) => ({ night, amount: guests * ratePerGuestNight }));
}
