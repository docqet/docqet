---
docqet: rule
id: ignored-files-arent-read
domain: authoring
name: Nothing is read from an ignored file
why: >-
  So files that mention Docqet without being about the project, such as docs
  that show example annotations, aren't read as its own.
---

Neither docs nor annotations are read from a file the project's
`.docqetignore` leaves out, or from anything in a folder it leaves out.
