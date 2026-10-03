import { z } from "zod"
import { acknowledgementsSchema, detailsSchema } from "./registration"

export const checkoutInputSchema = z.object({
  submissionKey: z.uuid(),
  submission: z.object({
    schemaVersion: z.literal(2),
    tournamentSlug: z.string().min(1).max(300),
    team: z.object({
      name: detailsSchema.shape.teamName,
      hometown: detailsSchema.shape.hometown,
    }),
    contact: z.object({
      firstName: detailsSchema.shape.firstName,
      lastName: detailsSchema.shape.lastName,
      email: detailsSchema.shape.email.transform((value) =>
        value.toLowerCase()
      ),
      phone: detailsSchema.shape.phone,
      role: z.enum(["Manager", "Coach", "Player", "Other"]),
    }),
    notes: detailsSchema.shape.notes,
    acknowledgements: acknowledgementsSchema,
  }),
})
export type CheckoutInput = z.infer<typeof checkoutInputSchema>
