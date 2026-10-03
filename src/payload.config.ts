import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { mcpPlugin } from "@payloadcms/plugin-mcp"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import path from "node:path"
import { buildConfig } from "payload"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

import { Users } from "./collections/Users"
import { Media } from "./collections/Media"
import { Folders } from "./collections/Folders"
import { Tags } from "./collections/Tags"
import { FormSubmissions } from "./collections/FormSubmissions"
import { Payments } from "./collections/Payments"
import { PaymentEvents } from "./collections/PaymentEvents"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Folders,
    Tags,
    FormSubmissions,
    Payments,
    PaymentEvents,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || "",
    ensureIndexes: true,
  }),
  sharp,
  localization: {
    locales: ["en"],
    fallback: true,
    defaultLocale: "en",
  },
  plugins: [mcpPlugin({})],
})
