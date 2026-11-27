import type { Booking, Stay } from "./stay";

// Stays are half-open: the check-out date isn't a night of the stay.
// docqet:implements rule:same-day-turnover
export function overlaps(a: Stay, b: Stay): boolean {
  return a.checkIn < b.checkOut && b.checkIn < a.checkOut;
}

// docqet:implements rule:no-double-booking component:bookings
export function assertRoomFree(roomId: string, stay: Stay, existing: Booking[]): void {
  const clash = existing.find(
    (booking) =>
      booking.roomId === roomId &&
      booking.status !== "cancelled" &&
      overlaps(booking.stay, stay),
  );
  if (clash) {
    throw new Error(`Room ${roomId} is already booked for part of that stay`);
  }
}
