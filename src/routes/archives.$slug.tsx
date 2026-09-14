import { createFileRoute, redirect } from "@tanstack/react-router";

// Archives have merged into Tournaments — every archived slug has a live
// tournament page carrying its teams, brackets and champion.
export const Route = createFileRoute("/archives/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/tournaments/$slug",
      params: { slug: params.slug },
    });
  },
});
