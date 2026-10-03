import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"

const require = createRequire(import.meta.url)
const rscPackage = createRequire(
  require.resolve("@payloadcms/tanstack-start")
).resolve("@tanstack/react-start-rsc/package.json")

// Component tests do not use Payload's server-component bundling pipeline.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "rsc-stream-decoder-test": resolve(
        dirname(rscPackage),
        "dist/esm/createServerComponentFromStream.js"
      ),
      "virtual:tanstack-rsc-browser-decode": resolve(
        "src/test/rsc-flight-fixture.ts"
      ),
    },
  },
  plugins: [react()],
  test: { server: { deps: { inline: [/@tanstack\/react-start-rsc/] } } },
})
