---
docqet: rule
id: one-client-per-server
domain: understanding
name: A server holds one client's projects
respects: [constraint:clients-never-see-each-other]
why: >-
  One client must never see another's projects, and a server holding only one
  client's has nothing of another's to show.
---
