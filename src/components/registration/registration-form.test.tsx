// @vitest-environment jsdom
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { RegistrationForm } from "./registration-form"
import {
  REGISTRATION_DRAFT_KEY,
  registrationDefaults,
  serializeRegistrationDraft,
} from "@/lib/registration"
import type { ApiTournament } from "@/lib/tournaments"

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

const now = new Date("2026-06-01T12:00:00Z")
const tournament = {
  id: 1,
  slug: "summer-invitational",
  name: "Summer invitational",
  class: "Class C & Below",
  date_from: "2026-06-19T12:00:00Z",
  date_to: "2026-06-21T16:00:00Z",
  price: 450,
  location: "Waterfront Park, Petoskey",
  teams: [],
  content: "LIMIT OF 5 TEAMS",
  meta_description: null,
} as unknown as ApiTournament
const validDraft = () => ({
  ...registrationDefaults(tournament.slug),
  details: {
    teamName: "Bay Sox",
    hometown: "Petoskey, MI",
    firstName: "Alex",
    lastName: "Kelly",
    email: "Alex@Example.com",
    phone: "(231) 555-0100",
    role: "Manager",
    notes: "",
  },
})

beforeEach(() => {
  sessionStorage.clear()
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(0), 0)
  )
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
  HTMLElement.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

async function openReview(
  onCheckout?: Parameters<typeof RegistrationForm>[0]["onCheckout"]
) {
  sessionStorage.setItem(
    REGISTRATION_DRAFT_KEY,
    serializeRegistrationDraft(validDraft(), now.getTime())
  )
  render(
    <RegistrationForm
      tournaments={[tournament]}
      now={now}
      onCheckout={onCheckout}
    />
  )
  fireEvent.click(screen.getByRole("button", { name: "Team details" }))
  await screen.findByLabelText("Team name")
  fireEvent.click(screen.getByRole("button", { name: "Review registration" }))
  await screen.findByRole("button", { name: "Edit team & contact" })
}

describe("registration form workflow", () => {
  it("validates the tournament step and focuses an available choice", async () => {
    render(<RegistrationForm tournaments={[tournament]} now={now} />)
    fireEvent.click(screen.getByRole("button", { name: "Team details" }))
    await screen.findByText(
      "Choose a tournament that is open for registration."
    )
    expect(screen.queryByLabelText("Team name")).toBeNull()
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("radio"))
    )
    fireEvent.click(screen.getByRole("radio"))
    fireEvent.click(screen.getByRole("button", { name: "Team details" }))
    await screen.findByLabelText("Team name")
    fireEvent.change(screen.getByLabelText("Team name"), {
      target: { value: "Bay Sox" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    await screen.findByRole("radio")
    fireEvent.click(screen.getByRole("button", { name: "Team details" }))
    expect(
      (await screen.findByLabelText<HTMLInputElement>("Team name")).value
    ).toBe("Bay Sox")
  })

  it("blocks invalid contact details and returns to editable answers", async () => {
    sessionStorage.setItem(
      REGISTRATION_DRAFT_KEY,
      serializeRegistrationDraft(validDraft(), now.getTime())
    )
    render(<RegistrationForm tournaments={[tournament]} now={now} />)
    fireEvent.click(screen.getByRole("button", { name: "Team details" }))
    await screen.findByLabelText("Email address")
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "invalid" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Review registration" }))
    await screen.findByText("Enter a valid email address.")
    await waitFor(() =>
      expect(document.activeElement?.id).toBe("details.email")
    )
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "alex@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Review registration" }))
    await screen.findByRole("button", { name: "Edit team & contact" })
    fireEvent.click(screen.getByRole("button", { name: "Edit team & contact" }))
    expect(
      (await screen.findByLabelText<HTMLInputElement>("Email address")).value
    ).toBe("alex@example.com")
  })

  it("checks the whole form without implying an entry or payment was submitted", async () => {
    await openReview()
    fireEvent.click(
      screen.getByRole("button", { name: "Check registration details" })
    )
    await screen.findByText("Please acknowledge the tournament rules.")
    expect(screen.queryByText("Your details are ready")).toBeNull()
    screen
      .getAllByRole("checkbox")
      .forEach((checkbox) => fireEvent.click(checkbox))
    fireEvent.click(
      screen.getByRole("button", { name: "Check registration details" })
    )
    await screen.findByText("Your details are ready")
    expect(
      screen.getByText("Checkout is not configured.")
    ).toBeTruthy()
  })

  it("passes normalized data to the checkout adapter and recovers from failure", async () => {
    const onCheckout = vi.fn().mockRejectedValue(new Error("Unavailable"))
    await openReview(onCheckout)
    screen
      .getAllByRole("checkbox")
      .forEach((checkbox) => fireEvent.click(checkbox))
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to secure checkout" })
    )
    await screen.findByText("Unavailable")
    expect(onCheckout).toHaveBeenCalledTimes(1)
    expect(onCheckout.mock.calls[0][0]).toMatchObject({
      tournamentSlug: tournament.slug,
      team: { name: "Bay Sox" },
      contact: { email: "alex@example.com" },
    })
    expect(onCheckout.mock.calls[0][0]).not.toHaveProperty("price")
    fireEvent.click(screen.getByRole("button", { name: "Edit team & contact" }))
    expect(
      (await screen.findByLabelText<HTMLInputElement>("Team name")).value
    ).toBe("Bay Sox")
  })

  it("restores a refresh draft, resets acknowledgments, and clears it on start over", async () => {
    await openReview()
    screen
      .getAllByRole("checkbox")
      .forEach((checkbox) => fireEvent.click(checkbox))
    cleanup()
    render(<RegistrationForm tournaments={[tournament]} now={now} />)
    await screen.findByText(/Draft restored/)
    fireEvent.click(screen.getByRole("button", { name: "Team details" }))
    expect(
      (await screen.findByLabelText<HTMLInputElement>("Team name")).value
    ).toBe("Bay Sox")
    fireEvent.click(screen.getByRole("button", { name: "Review registration" }))
    await screen.findByRole("button", { name: "Edit team & contact" })
    screen
      .getAllByRole("checkbox")
      .forEach((checkbox) =>
        expect(checkbox.getAttribute("aria-checked")).toBe("false")
      )
    fireEvent.click(screen.getByRole("button", { name: "Start over" }))
    await screen.findByRole("radio")
    await waitFor(() =>
      expect(sessionStorage.getItem(REGISTRATION_DRAFT_KEY)).toBeNull()
    )
    expect(screen.getByRole("radio").getAttribute("aria-checked")).toBe("false")
  })

  it("rejects completed URL preselection and a draft for a newly full tournament", async () => {
    const full = {
      ...tournament,
      teams: Array.from({ length: 5 }, (_, id) => ({
        id,
        team: `Team ${id}`,
        isPaid: true,
      })),
    }
    sessionStorage.setItem(
      REGISTRATION_DRAFT_KEY,
      serializeRegistrationDraft(validDraft(), now.getTime())
    )
    render(
      <RegistrationForm
        tournaments={[full]}
        preselectedSlug={full.slug}
        now={now}
      />
    )
    expect(screen.getByRole("radio").getAttribute("aria-checked")).toBe("false")
    expect(screen.getByRole("radio").getAttribute("aria-disabled")).toBe("true")
    fireEvent.click(screen.getByRole("button", { name: "Team details" }))
    await screen.findByText(
      "Choose a tournament that is open for registration."
    )
    expect(screen.queryByLabelText("Team name")).toBeNull()
  })

  it("rechecks tournament availability before handing off to checkout", async () => {
    const onCheckout = vi.fn()
    sessionStorage.setItem(
      REGISTRATION_DRAFT_KEY,
      serializeRegistrationDraft(validDraft(), now.getTime())
    )
    const view = render(
      <RegistrationForm
        tournaments={[tournament]}
        now={now}
        onCheckout={onCheckout}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Team details" }))
    await screen.findByLabelText("Team name")
    fireEvent.click(screen.getByRole("button", { name: "Review registration" }))
    await screen.findByRole("button", { name: "Edit team & contact" })
    screen
      .getAllByRole("checkbox")
      .forEach((checkbox) => fireEvent.click(checkbox))
    const full = {
      ...tournament,
      teams: Array.from({ length: 5 }, (_, id) => ({
        id,
        team: `Team ${id}`,
        isPaid: true,
      })),
    }
    view.rerender(
      <RegistrationForm
        tournaments={[full]}
        now={now}
        onCheckout={onCheckout}
      />
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to secure checkout" })
    )
    await screen.findByText(
      "Choose a tournament that is open for registration."
    )
    expect(onCheckout).not.toHaveBeenCalled()
  })

  it("prevents duplicate checkout attempts while the first is pending", async () => {
    let finish: () => void = () => {}
    const onCheckout = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        })
    )
    await openReview(onCheckout)
    screen
      .getAllByRole("checkbox")
      .forEach((checkbox) => fireEvent.click(checkbox))
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to secure checkout" })
    )
    await waitFor(() => expect(onCheckout).toHaveBeenCalledTimes(1))
    const submit = screen.getByRole("button", { name: "Please wait…" })
    expect((submit as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(submit)
    expect(onCheckout).toHaveBeenCalledTimes(1)
    finish()
    await screen.findByRole("button", { name: "Continue to secure checkout" })
  })
})
