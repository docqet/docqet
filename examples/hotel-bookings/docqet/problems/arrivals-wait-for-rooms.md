---
docqet: problem
id: arrivals-wait-for-rooms
name: Arriving guests wait for a room that isn't ready
description: >-
  A guest arrives and the desk doesn't know whether their room is ready, so
  the clerk phones housekeeping. Housekeeping didn't know that room was
  urgent, and gets rushed for it. When a room is ready, the housekeeper walks
  back down to say so.
cost: >-
  Guests wait at the desk for their room, clerks lose time on the phone, and
  housekeepers are rushed and walk the building twice.
felt-by: [persona:front-desk-clerk, persona:housekeeper]
subject-to: [constraint:rooms-cleaned-between-stays]
---
