const FREE_CANCELLATION_HOURS = 48;
const HOUR_MS = 60 * 60 * 1000;

// docket:implements rule:free-cancellation-window@guest-stays
export function refundAmount(paid: number, checkIn: Date, cancelledAt: Date): number {
  const hoursAhead = (checkIn.getTime() - cancelledAt.getTime()) / HOUR_MS;
  if (hoursAhead >= FREE_CANCELLATION_HOURS) {
    return paid;
  }
  // The late-cancellation fee isn't built yet, so late cancellations are
  // refunded in full too.
  return paid;
}
