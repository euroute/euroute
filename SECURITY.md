# Security Policy

Euroute is a small open-source project. Security reports are taken seriously and
handled as quickly as a small team reasonably can.

## Reporting a vulnerability

**Please do not open a public GitHub issue for a security problem.** Public
issues make an exploitable weakness available to everyone before it can be
fixed.

Instead, use GitHub's private vulnerability reporting on this repository:

1. Open the **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the problem and how to reproduce it.

A helpful report includes: what the issue is, the affected route or module, the
steps to reproduce, the impact you believe it has, and — if relevant — the
browser or environment used.

Please **do not include credentials, access tokens, session cookies, database
contents or other people's personal data** in a report. Describe the class of
data that can be reached rather than pasting it. If you believe a secret has
leaked, say which secret (by name) and where you found it, not its value.

Please give a reasonable amount of time for a fix before disclosing publicly.
Coordinated disclosure is welcome and credit is given if you want it.

## What to expect

- Acknowledgement of a report as soon as it is seen — this is a small project,
  so that may take a few days rather than a few hours.
- An assessment of whether the report is reproducible and what its impact is.
- A fix on `main`, deployed to the hosted service, followed by disclosure once
  users are protected.

There is no bug bounty.

## Supported versions

| Version | Supported |
| --- | --- |
| Current `main` | Yes |
| The hosted service at <https://euroute.app> | Yes |
| Older commits, tags and forks | No |

Euroute is developed as a continuously deployed application, not as a versioned
library. Fixes land on `main` and reach the hosted service from there; older
revisions are not patched. If you run your own deployment, track `main`.

## Scope notes

- Euroute holds no payment data and sells no tickets.
- Routing and timetable data comes from the public
  [Transitous](https://transitous.org/) service. Issues in upstream data or in
  Transitous itself should be reported to that project; issues in how Euroute
  requests, caches, rate-limits or renders that data belong here.
- The publishable/anon backend key and the backend URL are public by design and
  protected by row-level security. A report that these values are visible in the
  client bundle is not a vulnerability. A report that they grant access beyond
  what row-level security should allow very much is.
