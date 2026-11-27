---
docqet: rule
id: how-a-payouts-status-progresses
name: How a payout's status progresses
---

A payout is Processing once sent, then Paid when the payment provider posts it,
or Failed if it's returned. A Paid payout becomes Failed only if the payment
provider returns it later. The one in use posts a payout as soon as it's sent,
pays it on to the bank itself, and keeps for the payee anything the bank sends
back, so its payouts stay Paid.
