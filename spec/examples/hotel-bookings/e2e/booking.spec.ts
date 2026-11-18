import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/test/bookings", {
    data: { room: "12", checkIn: "2026-12-01", checkOut: "2026-12-04" },
  });
});

// docket:verifies rule:booking/no-double-booking
test("a clerk can't book a room that's taken", async ({ page }) => {
  await page.goto("/bookings/new");
  await page.getByLabel("Room").fill("12");
  await page.getByLabel("Check-in").fill("2026-12-03");
  await page.getByLabel("Check-out").fill("2026-12-05");
  await page.getByRole("button", { name: "Book" }).click();
  await expect(page.getByRole("alert")).toHaveText("Room 12 is already booked for part of that stay");
});

// docket:verifies capability:room-booking
test("a clerk books a free room for a guest", async ({ page }) => {
  await page.goto("/bookings/new");
  await page.getByLabel("Room").fill("14");
  await page.getByLabel("Check-in").fill("2026-12-03");
  await page.getByLabel("Check-out").fill("2026-12-05");
  await page.getByRole("button", { name: "Book" }).click();
  await expect(page.getByRole("status")).toHaveText("Room 14 is booked");
});
