CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
  id text PRIMARY KEY,
  room_id text NOT NULL,
  nights daterange NOT NULL,
  status text NOT NULL,
  -- Two requests racing for the same room can't both be saved, whatever the
  -- code checked first.
  -- docket:implements rule:no-double-booking@guest-stays component:bookings
  -- docket:tradeoff component:bookings#constraint-not-lock
  EXCLUDE USING gist (room_id WITH =, nights WITH &&) WHERE (status <> 'cancelled')
);
