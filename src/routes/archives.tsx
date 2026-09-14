import { createFileRoute, Navigate, Outlet, useMatch } from "@tanstack/react-router";
import { archiveYears } from "@/lib/data";

// Archives have merged into Tournaments — /tournaments?year= covers every
// season back to 2003. Keep this route so old links land in the right place.
export const Route = createFileRoute("/archives")({
  validateSearch: (s: Record<string, unknown>): { year?: number } => {
    const raw = s.year;
    const y =
      typeof raw === "string" ? Number.parseInt(raw, 10) : typeof raw === "number" ? raw : undefined;
    return { year: y !== undefined && archiveYears.includes(y) ? y : undefined };
  },
  component: ArchivesRedirect,
});

function ArchivesRedirect() {
  const slugMatch = useMatch({ from: "/archives/$slug", shouldThrow: false });
  if (slugMatch) return <Outlet />;
  const { year } = Route.useSearch();
  return <Navigate to="/tournaments" search={year ? { year } : {}} />;
}
