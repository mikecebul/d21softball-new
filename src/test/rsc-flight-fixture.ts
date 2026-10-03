import type { ReactNode } from "react"

let tree: Promise<ReactNode>
export const setFlightTree = (value: Promise<ReactNode>) => {
  tree = value
}
export const createFromReadableStream = () => tree
