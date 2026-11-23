// Dates are ISO dates (YYYY-MM-DD), so they compare correctly as strings.
export type Stay = { checkIn: string; checkOut: string };

export type Booking = {
  id: string;
  roomId: string;
  stay: Stay;
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled";
};

// docket:implements rule:minimum-stay@guest-stays
export function parseStay(checkIn: string, checkOut: string): Stay {
  if (checkOut <= checkIn) {
    throw new Error("A stay must be at least one night");
  }
  return { checkIn, checkOut };
}
