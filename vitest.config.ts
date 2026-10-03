import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

// Component tests do not use Payload's server-component bundling pipeline.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [react()],
})
