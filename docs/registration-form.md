# Tournament registration form

The account-free flow has three steps: tournament selection, team and contact information, and review. It uses one TanStack Form instance, composed field components, and `FormGroup` validation for each step, following the registration workflow in the local `drug-test-mi` repository. Whole-form validation runs again before a checkout handoff, including a fresh tournament availability check.

## Implementation

- `src/routes/register.tsx`: loads the season and passes a tournament URL preselection. The success route renders separately from the form.
- `src/components/registration/registration-form.tsx`: owns form state, navigation, focus, drafts, the summary, and checkout feedback.
- `src/components/registration/steps.tsx`: typed step components with per-step Zod schemas and editable review sections.
- `src/components/forms`: reusable text, select, notes, and acknowledgment components bound through `createFormHook`.
- `src/lib/registration.ts`: schemas, defaults, draft helpers, fee formatting, and the submission contract.

Answers save in `sessionStorage`, scoped to the tab, with a 24-hour expiration from the last save. Refresh restores unfinished answers at the first step so the selection can be reviewed. A tournament that has closed or filled is cleared from the draft. An available tournament in a new URL takes precedence over the saved selection. Rules and authorization acknowledgments are never stored and must be made again. Corrupt or expired drafts are discarded, storage failures leave the form usable, and Start over clears the draft.

The form asks for team name, hometown, contact name, email, phone, role, and optional notes. Team classification and roster size are not collected. Existing drafts restore the remaining answers and discard those old fields. Acknowledgments cover reviewing published rules and authorization to register the team; the form does not invent a liability waiver.

## Backend handoff

`RegistrationForm` accepts an optional asynchronous `onCheckout` adapter. It receives the normalized `RegistrationSubmission` exported from `src/lib/registration.ts`:

- `schemaVersion: 2`
- `tournamentSlug`
- `team`: name, hometown
- `contact`: first name, last name, email (trimmed/lowercase), phone, role
- `notes`
- `acknowledgements`: rules reviewed and authorized to register

The contract excludes fees, order IDs, and payment status. `registrationCheckout` posts it to `/api/registration/checkout` with a stable submission UUID for identical retries. The server independently validates it, resolves the current tournament and fee, checks availability, and saves the original submission and payment attempt before creating Stripe Checkout. Acknowledgment timestamps are recorded by the server.

The public route supplies this adapter. “Continue to secure checkout” opens Stripe's hosted page; pending attempts are disabled and failures preserve the answers. Identical retries reuse an open session and its persisted idempotency key. Changed answers create a new original submission. Start over also clears the checkout request identity.

`/api/stripe/webhook` verifies Stripe's raw-body signature and reconciles current Stripe objects before updating payment history and confirming an entry. The success page polls the database and never treats a redirect as proof of payment. See [the history model and event list](registration-history.md). Email delivery, tournament/media migration, and atomic capacity reservations remain future work.

## Trying the form locally

Configure `.env` using `.env.example`, start the Stripe CLI listener described in the README, and run `pnpm dev`. Open `/register?tournament=registration-preview`. Development adds “Test Tournament — Registration Preview,” with a sample $600 fee, 12 open spots, and a Friday–Sunday weekend at least four weeks ahead. Its dates advance automatically. Complete the form and continue to Stripe Checkout using a test key. The server rejects this sample with live keys or production builds.

The sample appears only on the development registration page. It is not added to the upstream API, published tournament list, archives, or production builds.

## Verification

`pnpm test` covers form validation/drafts/navigation, checkout failures, authoritative fee/input validation, immutable retry identity, payment reconciliation, history invariants, and the React Flight suspension regression. Browser verification reached the actual Stripe sandbox and restored the cancelled checkout's draft. Signed webhook fixtures were tested against an isolated MongoDB database for confirmation, concurrent deduplication, out-of-order refunds, partial/full refunds, disputes, failed-event retries, and retained versions. No real payment was made.
