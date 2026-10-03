# Tournament registration form

The account-free flow has three steps: tournament selection, team and contact information, and review. It uses one TanStack Form instance, composed field components, and `FormGroup` validation for each step, following the registration workflow in the local `drug-test-mi` repository. Whole-form validation runs again before a checkout handoff, including a fresh tournament availability check.

## Implementation

- `src/routes/register.tsx`: loads the season and passes a tournament URL preselection. The success route renders separately from the form.
- `src/components/registration/registration-form.tsx`: owns form state, navigation, focus, drafts, the summary, and checkout feedback.
- `src/components/registration/steps.tsx`: typed step components with per-step Zod schemas and editable review sections.
- `src/components/forms`: reusable text, select, notes, and acknowledgment components bound through `createFormHook`.
- `src/lib/registration.ts`: schemas, defaults, draft helpers, fee formatting, and the submission contract.

Answers save in `sessionStorage`, scoped to the tab, with a 24-hour expiration from the last save. Refresh restores unfinished answers at the first step so the selection can be reviewed. A tournament that has closed or filled is cleared from the draft. An available tournament in a new URL takes precedence over the saved selection. Rules and authorization acknowledgments are never stored and must be made again. Corrupt or expired drafts are discarded, storage failures leave the form usable, and Start over clears the draft.

The form asks for team name, hometown, classification, optional roster estimate, contact name, email, phone, role, and optional notes. The classification includes a “Not sure” choice so the commissioner can resolve eligibility. Acknowledgments cover reviewing published rules and authorization to register the team; the form does not invent a liability waiver.

## Backend handoff

`RegistrationForm` accepts an optional asynchronous `onCheckout` adapter. It receives the normalized `RegistrationSubmission` exported from `src/lib/registration.ts`:

- `schemaVersion: 1`
- `tournamentSlug`
- `team`: name, hometown, classification, estimated roster size (nullable)
- `contact`: first name, last name, email (trimmed/lowercase), phone, role
- `notes`
- `acknowledgements`: rules reviewed and authorized to register

The contract excludes fees, order IDs, and payment status. The later Payload server handler must validate this data independently, resolve the tournament, recheck capacity and eligibility, store the submission, and calculate the authoritative fee before creating Stripe Checkout. Payment confirmation must come from a verified webhook. Acknowledgment timestamps and any document versions should be recorded by the backend.

There is no adapter on the public route yet. Its final action checks the details and explicitly states that no entry or payment has been submitted. Connecting an adapter changes the action to “Continue to secure checkout”; pending attempts are disabled, and a failed adapter preserves the answers for retry. The current success route also cannot claim payment confirmation.

Payload installation, collections, Stripe endpoints, emails, and migration from `api.d21softball.org` are intentionally reserved for the next backend phase. The local `cvx-junior-golf` repository is the user's requested reference for that phase.

## Trying the form locally

Run `pnpm dev` and open `/register?tournament=registration-preview`. Development adds “Test Tournament — Registration Preview” to the registration choices, with a sample $600 fee, 12 open spots, and a Friday–Sunday weekend at least four weeks ahead. Its dates advance automatically so the form stays testable after the real season ends. Complete the team details, review them, and select “Check registration details” to exercise validation without submitting an entry or taking payment.

The sample appears only on the development registration page. It is not added to the upstream API, published tournament list, archives, or production builds.

## Verification

`pnpm test` covers availability, schema validation, normalization, expired and corrupt drafts, refreshed consent, navigation, invalid-field focus, editing, preview checks, checkout failures, capacity changes before handoff, and duplicate-attempt prevention. Browser checks use the development sample tournament to exercise the full desktop/mobile flow without changing production tournament data.
