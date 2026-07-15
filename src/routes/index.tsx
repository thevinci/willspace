import { createFileRoute } from "@tanstack/react-router";
import { CyberCity } from "@/components/pages/home/CyberCity";
import "@/components/pages/home/cyber-city.css";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CyberCity />;
}
