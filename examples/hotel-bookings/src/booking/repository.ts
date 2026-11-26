import type { Pool } from "pg";
import type { Booking } from "./stay";

// The bookings table refuses a booking that shares a night with another for
// the same room (see db/migrations/001_bookings.sql).
// docqet:implements capability:room-booking component:bookings
// docqet:gap component:bookings#clashes-logged-as-unknown
export async function saveBooking(db: Pool, booking: Booking): Promise<void> {
  await db.query(
    "INSERT INTO bookings (id, room_id, nights, status) VALUES ($1, $2, daterange($3, $4), $5)",
    [booking.id, booking.roomId, booking.stay.checkIn, booking.stay.checkOut, booking.status],
  );
}
