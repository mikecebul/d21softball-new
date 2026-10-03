import type { CollectionConfig } from "payload"
import {
  historyAccess,
  immutableHistoryFields,
  minorUnits,
  timestamp,
} from "./history"

export const PaymentEvents: CollectionConfig = {
  slug: "payment-events",
  labels: { singular: "Stripe event", plural: "Stripe events" },
  admin: {
    group: "Registration & payments",
    useAsTitle: "stripeEventId",
    defaultColumns: [
      "eventType",
      "payment",
      "processingStatus",
      "livemode",
      "receivedAt",
    ],
    description:
      "Verified Stripe events and their processing history. No raw webhook bodies or card details are stored.",
  },
  access: historyAccess,
  timestamps: true,
  versions: { maxPerDoc: 0 },
  hooks: {
    beforeChange: [
      immutableHistoryFields([
        "stripeEventId",
        "eventType",
        "stripeObjectId",
        "stripeCreatedAt",
        "receivedAt",
        "signatureVerifiedAt",
        "livemode",
        "summary",
        "createdAt",
      ]),
    ],
  },
  fields: [
    {
      name: "stripeEventId",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Deduplicate webhook deliveries using the Stripe event ID.",
      },
    },
    { name: "eventType", type: "text", required: true, index: true },
    { name: "stripeObjectId", type: "text", required: true, index: true },
    {
      name: "payment",
      type: "relationship",
      relationTo: "payments",
      index: true,
      admin: {
        description:
          "May be empty for unmatched events; retain them for reconciliation.",
      },
    },
    {
      name: "livemode",
      type: "checkbox",
      required: true,
      defaultValue: false,
      index: true,
    },
    { name: "stripeCreatedAt", type: "date", required: true },
    {
      name: "receivedAt",
      type: "date",
      required: true,
      defaultValue: timestamp,
      index: true,
    },
    { name: "signatureVerifiedAt", type: "date", required: true },
    {
      name: "processingStatus",
      type: "select",
      required: true,
      defaultValue: "received",
      index: true,
      options: ["received", "processed", "ignored", "failed"],
    },
    {
      name: "processingAttempts",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
      validate: minorUnits,
    },
    { name: "lastAttemptAt", type: "date" },
    { name: "processedAt", type: "date" },
    {
      name: "error",
      type: "textarea",
      maxLength: 500,
      admin: {
        description:
          "Sanitized processing error for retries and reconciliation.",
      },
    },
    {
      name: "summary",
      type: "group",
      fields: [
        { name: "objectType", type: "text" },
        {
          name: "amount",
          label: "Event amount (cents)",
          type: "number",
          min: 0,
          validate: minorUnits,
        },
        { name: "currency", type: "text" },
        { name: "stripeStatus", type: "text" },
        { name: "chargeId", type: "text" },
        { name: "refundId", type: "text" },
      ],
    },
  ],
}
