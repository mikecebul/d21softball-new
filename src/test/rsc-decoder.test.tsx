// @vitest-environment jsdom
import { Suspense } from "react"
import type { ReactNode } from "react"
import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { createRenderableFromStream } from "rsc-stream-decoder-test"
import { setFlightTree } from "./rsc-flight-fixture"

vi.mock("@tanstack/start-client-core", () => ({
  trackPostProcessPromise: vi.fn(),
}))
afterEach(cleanup)

it("renders a Flight stream that suspends and then resolves with React 19.3", async () => {
  let resolve!: (tree: ReactNode) => void
  setFlightTree(
    new Promise((done) => {
      resolve = done
    })
  )
  const tree = createRenderableFromStream(new ReadableStream())
  let view!: ReturnType<typeof render>
  await act(async () => {
    view = render(<Suspense fallback={<p>Loading stream</p>}>{tree}</Suspense>)
  })
  expect(screen.queryByText("Stream ready")).toBeNull()
  await act(async () => {
    resolve(<p>Stream ready</p>)
  })
  expect(screen.getByText("Stream ready")).toBeTruthy()
  await act(async () => {
    view.rerender(<Suspense fallback={<p>Loading stream</p>}>{tree}</Suspense>)
  })
  expect(screen.getByText("Stream ready")).toBeTruthy()
})
