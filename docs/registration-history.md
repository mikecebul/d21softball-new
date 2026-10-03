# Registration and payment history

The Payload admin groups these collections under **Registration & payments**. Entrants remain account-free. CMS users can read records and versions; direct REST/GraphQL creation, editing, and deletion are denied, including for CMS users. Trusted server operations must use the Local API with an explicit `overrideAccess: true` after validating an entry or verifying Stripe's signature. No public collection endpoint may accept payment state, prices, or Stripe IDs from a browser.

## Form submissions

Each completed entry has an immutable original snapshot: a unique `submissionKey`, form type and schema version, submission time/source, tournament slug/API ID/name/dates/location, team name/hometown, contact details, optional notes, consent flags/time/rules URL/revision, and the server-calculated entry fee/currency. The current form contract is version 2 and does not collect classification or team size.

The tournament snapshot retains the entry's original context when an event is renamed, repriced, or migrated into Payload. A tournament relationship can be added alongside this snapshot during that migration. No invented tournament or forms collection is required to store the entry.

Workflow fields record submitted, confirmed, or cancelled status, confirmation/cancellation times and the cancellation reason. Linked payments show every attempt. The checkout endpoint checks the existing key and original answers: identical retries reuse it, while revised answers create a new submission.

## Payments

Each checkout attempt is a separate payment linked to its submission. The submission/attempt-number combination and payment key are unique. Use the persisted payment key as Stripe's idempotency key; retrying a failed network call reuses it, while deliberately starting a new checkout attempt increments the attempt number and creates a new record.

Records contain expected/received/refunded amounts in integer minor units (USD cents), currency, provider, test/live mode, lifecycle status, Stripe Checkout Session/PaymentIntent/customer/account/charge IDs, session expiration, receipt URL, payment-method type, success/failure/expiry/cancellation times, and sanitized failure codes/messages. Every refund retains its Stripe refund ID, amount, status, reason, creation time and failure reason. Dispute fields retain the Stripe dispute ID, amount, reason and state independently of payment status.

The original expected amount, currency, submission, attempt number, key, provider, and test/live mode cannot be replaced. Session and PaymentIntent IDs can be set after checkout creation but cannot subsequently be swapped. Financial validation rejects fractional/negative/unsafe cent values, mismatched successful amounts, duplicate refund IDs, over-refunds, inconsistent refund totals, and invalid partial/full refund states.

## Stripe events

A uniquely indexed Stripe event ID provides the basis for webhook deduplication. Store event type, object ID, test/live mode, Stripe event creation time, receipt and signature-verification times, payment link, processing status, attempt count, last attempt/processed times, sanitized processing errors, and a small financial/object summary. Unmatched verified events can be retained without a payment link for reconciliation. Original event evidence cannot be changed; processing results can advance through trusted server writes.

All three collections retain unlimited Payload versions (`maxPerDoc: 0`) so prior workflow and accounting states remain available. Records cannot be deleted through the normal admin/API interface. This is application history, not a tamper-proof ledger against direct database access.

## Connecting the existing Stripe account

These collections do not need the Payload Stripe plugin. Hosted Checkout and a signature-verified webhook can use Stripe's server SDK with the business's existing account. Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in server environment variables; hosted Checkout does not require a publishable key in this frontend. Never store secret keys, card numbers, CVCs, client secrets, or raw webhook bodies in these records.

The checkout and webhook handlers implement this flow:

1. Validate the full form and current tournament availability server-side. Resolve the fee from trusted tournament data, then save the original submission before calling Stripe, including a server-recorded consent time.
2. Reserve/create a payment attempt and persist its idempotency key. Create Checkout using server-calculated amounts, a fixed configured return origin, and submission/payment references in metadata. Save the returned session IDs and expiry.
3. Verify the raw webhook body and `Stripe-Signature` before creating event records. Deduplicate by event ID and retain processing attempts/errors. A duplicate failed or unfinished event must be retried rather than blindly acknowledged as complete.
4. Retrieve current Checkout Session and PaymentIntent state because events can arrive out of order. Confirm registration only after paid status and a succeeded PaymentIntent, with expected amount, currency, mode and identity checks. The success redirect alone never marks an entry paid. Refund/dispute events can locate the payment through PaymentIntent metadata even before its ID is saved locally.
5. Serialize reconciliation with an atomic, expiring MongoDB lease per payment. Financial updates run through Payload hooks and versions. Mark an event processed only after payment/submission updates finish. Failed or interrupted events remain retryable; authoritative reconciliation repairs partial updates on replay. This supports standalone MongoDB without pretending multi-record writes are a transaction.

The endpoint is `/api/stripe/webhook`, using Stripe API version `2026-09-30.endive`. Subscribe to these snapshot events:

```text
checkout.session.completed
checkout.session.expired
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
payment_intent.processing
payment_intent.succeeded
payment_intent.payment_failed
payment_intent.canceled
refund.created
refund.updated
refund.failed
charge.dispute.created
charge.dispute.updated
charge.dispute.closed
```

Local testing uses `stripe listen --all-snapshot --forward-to http://localhost:3000/api/stripe/webhook` and the listener's signing secret. Configure `SITE_URL` to the actual public origin for deployment; local development can infer a localhost origin. Restricted keys need access to Checkout Sessions (write), PaymentIntents, Charges, Refunds, and Disputes (read); Stripe CLI listening additionally requires Debugging Tools write. Test/live mode is retained on every payment.

Availability currently checks upstream spots and locally confirmed entries before checkout; it does not atomically reserve capacity across simultaneous unpaid checkouts. Add reservations during the tournament migration before relying on strict online capacity limits. Confirmation email delivery and refund/cancellation policies also remain to be implemented. Refunds update accounting history without automatically cancelling a tournament entry.

References: [Stripe Checkout](https://docs.stripe.com/payments/checkout/how-checkout-works?payment-ui=stripe-hosted), [Stripe webhook signatures, duplicate deliveries and event ordering](https://docs.stripe.com/webhooks), [Payload versions](https://payloadcms.com/docs/versions/overview).
