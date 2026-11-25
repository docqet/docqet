import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/test/stays", {
    data: { room: "12", nights: 2, nightlyRate: 15000, deposit: 15000 },
  });
});

// docket:verifies capability:deposits rule:deposit-counts-towards-the-bill@billing
test("a guest's deposit is taken off their bill at check-out", async ({ page }) => {
  await page.goto("/rooms/12/check-out");
  await expect(page.getByRole("row", { name: "Deposit" })).toContainText("−150.00");
  await expect(page.getByRole("row", { name: "To pay" })).toContainText("150.00");
});
