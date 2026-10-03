import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { withPayload } from "@payloadcms/tanstack-start"
import rsc from "@vitejs/plugin-rsc"
import path from "node:path"
import { fileURLToPath } from "node:url"
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = defineConfig(
  withPayload(
    ({ pluginOptions }) => ({
      resolve: { tsconfigPaths: true },
      plugins: [
        devtools(),
        tailwindcss(),
        rsc(pluginOptions.rsc),
        tanstackStart(pluginOptions.tanstackStart),
        viteReact(pluginOptions.react),
      ],
    }),
    {
      payloadConfigPath: path.resolve(__dirname, "src", "payload.config.ts"),
      routesDirectory: "routes",
    }
  )
)

export default config
