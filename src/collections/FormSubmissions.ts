import type { CollectionConfig } from "payload"
import {
  accepted,
  currencyCode,
  historyAccess,
  immutableHistoryFields,
  minorUnits,
  newHistoryKey,
  positiveInteger,
  timestamp,
} from "./history"

export const FormSubmissions: CollectionConfig = {
  slug: "form-submissions",
  labels: { singular: "Form submission", plural: "Form submissions" },
  admin: {
    group: "Registration & payments",
    useAsTitle: "submissionKey",
    defaultColumns: [
      "team.name",
      "tournament.name",
      "contact.email",
      "status",
      "submittedAt",
    ],
    description:
      "Original registrations and their linked payment attempts. Records are written by the server and retained for history.",
  },
  access: historyAccess,
  timestamps: true,
  versions: { maxPerDoc: 0 },
  hooks: {
    beforeChange: [
      immutableHistoryFields([
        "submissionKey",
        "formType",
        "schemaVersion",
        "submittedAt",
        "source",
        "tournament",
        "team",
        "contact",
        "notes",
        "acknowledgements",
        "pricing",
        "createdAt",
      ]),
    ],
  },
  fields: [
    {
      name: "submissionKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
      defaultValue: newHistoryKey,
      admin: {
        description:
          "Reuse this key when retrying the same submission; create a new key for revised answers.",
      },
    },
    {
      name: "formType",
      type: "select",
      required: true,
      defaultValue: "tournament-registration",
      options: [
        { label: "Tournament registration", value: "tournament-registration" },
      ],
    },
    {
      name: "schemaVersion",
      type: "number",
      required: true,
      defaultValue: 2,
      validate: positiveInteger,
    },
    {
      name: "submittedAt",
      type: "date",
      required: true,
      index: true,
      defaultValue: timestamp,
    },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "website",
      options: [
        { label: "Website", value: "website" },
        { label: "Staff assisted", value: "staff" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "submitted",
      index: true,
      options: [
        { label: "Submitted / awaiting payment", value: "submitted" },
        { label: "Registration confirmed", value: "confirmed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { name: "confirmedAt", type: "date" },
    { name: "cancelledAt", type: "date" },
    { name: "cancellationReason", type: "textarea", maxLength: 1000 },
    {
      name: "tournament",
      type: "group",
      fields: [
        { name: "slug", type: "text", required: true, index: true },
        {
          name: "sourceId",
          type: "text",
          admin: {
            description:
              "ID in the original tournaments API, until tournaments are migrated into Payload.",
          },
        },
        { name: "name", type: "text", required: true },
        { name: "dateFrom", type: "date", required: true },
        { name: "dateTo", type: "date", required: true },
        { name: "location", type: "text", required: true },
      ],
      admin: {
        description:
          "Snapshot at submission time; later tournament edits do not rewrite the entry.",
      },
    },
    {
      name: "team",
      type: "group",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          maxLength: 100,
          index: true,
        },
        { name: "hometown", type: "text", required: true, maxLength: 100 },
      ],
    },
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "firstName", type: "text", required: true, maxLength: 100 },
        { name: "lastName", type: "text", required: true, maxLength: 100 },
        { name: "email", type: "email", required: true, index: true },
        { name: "phone", type: "text", required: true, maxLength: 50 },
        {
          name: "role",
          type: "select",
          required: true,
          options: ["Manager", "Coach", "Player", "Other"],
        },
      ],
    },
    { name: "notes", type: "textarea", maxLength: 1000 },
    {
      name: "acknowledgements",
      type: "group",
      fields: [
        { name: "rules", type: "checkbox", required: true, validate: accepted },
        {
          name: "authorized",
          type: "checkbox",
          required: true,
          validate: accepted,
        },
        {
          name: "acceptedAt",
          type: "date",
          required: true,
          defaultValue: timestamp,
        },
        {
          name: "rulesUrl",
          type: "text",
          required: true,
          defaultValue: "/rules",
        },
        {
          name: "rulesVersion",
          type: "text",
          admin: {
            description:
              "Document revision when formal rule versions become available.",
          },
        },
      ],
    },
    {
      name: "pricing",
      type: "group",
      fields: [
        {
          name: "amountExpected",
          label: "Entry fee (cents)",
          type: "number",
          required: true,
          min: 0,
          validate: minorUnits,
        },
        {
          name: "currency",
          type: "text",
          required: true,
          defaultValue: "usd",
          validate: currencyCode,
        },
      ],
      admin: {
        description:
          "Calculated by the server from the tournament, never from a browser-supplied price. 60000 cents = $600 USD.",
      },
    },
    {
      name: "payments",
      type: "join",
      collection: "payments",
      on: "submission",
    },
  ],
}
