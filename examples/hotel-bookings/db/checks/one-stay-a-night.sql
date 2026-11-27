-- Run by the night audit: any row it returns is a room with two stays on one
-- night, whatever booked them.
-- docqet:verifies constraint:one-stay-a-room-a-night
SELECT a.room_id, a.id AS booking, b.id AS clashes_with
FROM bookings a
JOIN bookings b ON a.room_id = b.room_id AND a.id < b.id AND a.nights && b.nights
WHERE a.status <> 'cancelled' AND b.status <> 'cancelled';
