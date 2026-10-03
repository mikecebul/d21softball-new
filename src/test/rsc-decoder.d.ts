declare module "rsc-stream-decoder-test" {
  import type { ReactNode } from "react"

  export function createRenderableFromStream(stream: ReadableStream): ReactNode
}
