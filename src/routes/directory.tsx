import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/directory")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="p-4">Hello "/directory"!</div>;
}
