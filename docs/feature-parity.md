# Original D21 website feature comparison

Verified against the live public website on October 1, 2026. The original page data was read from its rendered HTML, including tournament and league records, resource destinations and committee members.

| Original page                                                            | New destination                        | Coverage                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Home](https://d21softball.org/)                                         | `/`                                    | Tournament lineup, season news dated January 16, 2026, typical weekend format and four-game guarantee, four state championship notices, pitcher PDF, certified equipment directory, historical bat PDF, umpire packet, Facebook scores/scorebooks/award photos, sponsors and commissioner contact.                |
| [Tournaments](https://d21softball.org/tournaments)                       | `/tournaments`                         | All five published 2026 tournaments, exact dates/classes/fees from the original API, team lists and links to detail pages.                                                                                                                                                                                        |
| Tournament detail pages                                                  | `/tournaments/$slug`                   | Original description, lead image with full-size link, all listed teams and payment status, bracket download, written results, linked full-size photos/documents and Facebook follow-up. Removed invented champion/runner-up names from the previous sample dataset.                                               |
| [Pitcher classification](https://d21softball.org/pitcher-classification) | `/pitcher-classification` and `/rules` | July 13, 2026 classification PDF and all 18 committee members with exact positions and locations. Original appeal-process content is empty; replaced the invented procedure with a commissioner contact link.                                                                                                     |
| [Archives](https://d21softball.org/archives)                             | `/archives` → `/tournaments?year=2025` | All 142 published records, 23 seasons from 2003 through 2026, excluding 2020 (no tournament records). Older `?year=` links work through 2003. `/archives/$slug` redirects to the matching tournament detail.                                                                                                      |
| [Hall of Fame](https://d21softball.org/hall-of-fame)                     | `/hall-of-fame`                        | Existing live directory preserves all honorees, roles, locations, induction years, available biographies/articles/documents, and both gallery photographs. Search, contribution filters, chronological sorting and photo enlargement remain available.                                                            |
| [Fuel/Motels](https://d21softball.org/motel)                             | `/motel` → `/visit`                    | Existing lodging link, Blarney Castle information, all 13 amenities, 807 Spring Street directions, locations map and four-page directory, downloadable map/directory PDFs.                                                                                                                                        |
| [Local leagues](https://d21softball.org/local-leagues)                   | `/local-leagues`                       | Men's and women's Petoskey fastpitch, Ed Smith/City of Petoskey contacts, East Jordan co-ed slowpitch and Robert Crick contact, all 23 available league schedules/standings/stats/champion photo links from 2018–2025. Empty resource entries with no file/link on the original are not rendered as dead actions. |
| [Umpires](https://d21softball.org/umpire)                                | `/umpire` → `/umpires`                 | Original registration packet, direct Michigan umpire-information URL and commissioner email/phone. Packet accurately labeled as historical (2017).                                                                                                                                                                |
| Shared navigation/footer                                                 | Every page                             | Original public sections are discoverable, including dedicated Pitchers and Archives links. All five sponsor logos/destinations, commissioner contact/address, USA Softball of Michigan and Facebook links. DJS Holdings has no destination in the current source, so its logo is displayed without a dead link.  |

## Corrections made during verification

- Fixed a React hook-order crash when navigating from the tournament list to a detail page and back.
- Restored the original lead tournament photographs and full-size result-media links. Bracket sections appear even when results have not been posted.
- Fixed archive year validation, which previously discarded seasons before 2016; archive navigation now opens the past season by default.
- Removed placeholder committee members, unsupported classification appeal/check-in rules and invented historical champions.
- Completed/full tournaments cannot be preselected through registration URLs or advanced through registration validation.
- Removed simulated checkout and fabricated payment confirmations. The registration pages clearly state that online checkout is unavailable and provide commissioner contact links.
- Tournament API cache expires after five minutes so newly posted brackets and team updates can refresh without restarting the server.

## Remaining integration work

Public-page features are covered. Actual online team registration/payment is not complete: this repository has no Payload CMS backend, persisted registration/order storage, Stripe Checkout session endpoint, payment webhook verification, or receipt-email service. The three-step TanStack form remains a preview, and the success route cannot claim payment or entry confirmation from URL parameters. Live checkout requires the intended Payload backend and Stripe configuration before it can be enabled and verified.

Account login, signup, password recovery and a user dashboard are intentionally excluded by `AGENTS.md`. The replacement flow is the account-free tournament registration form and eventual Stripe checkout.

The migrated classification/league resources are an explicit source snapshot in `src/lib/original-site-content.ts`; future editorial updates should be managed by Payload. Tournament and Hall of Fame records still come from the original public API. The pitcher PDF retains an older filename despite containing the 2026 list; resource URLs match the actual source.

## Verification

- All 142 tournament detail pages returned HTTP 200 with matching original titles and every original bracket, lead image and result-media link preserved.
- Hall of Fame search reduced the directory to one member and opened Adam Lalonde’s biography successfully.
- 49 original source document/image URLs checked successfully (HTTP 200), including all restored league resources and the classification, bat and umpire PDFs.
- Browser navigation checked from tournaments to detail and back, mobile drawer to Archives, and the oldest season (2003, nine tournaments).
- Main public routes and registration pages checked at 390px width; no page-level horizontal overflow or visible route error.
- Original `/motel`, `/umpire`, `/pitcher-classification`, `/archives?year=2003` and archived detail links checked.
- TypeScript, production build, lint on changed source files and nine unit tests passed.
