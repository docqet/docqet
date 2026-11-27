---
docqet: rule
id: email-only-to-verified-addresses
domain: accounts
name: Email only to verified addresses
respects: [constraint:no-unwanted-bulk-email]
---

Email goes only to a verified address on the person's account, the one they
chose for that notification or else their first.
