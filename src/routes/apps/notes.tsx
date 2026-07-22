import { createFileRoute } from "@tanstack/react-router";
import { AppsLeftBar } from "@/components/pages/apps/AppsLeftBar";

export const Route = createFileRoute("/apps/notes")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 min-h-0">
      <AppsLeftBar />
      <main className="flex-1 p-6 overflow-y-auto">Notes</main>
    </div>
  );
}
