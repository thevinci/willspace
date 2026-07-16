import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function RightSidebar({
  content,
  ...props
}: Omit<React.ComponentProps<typeof Sidebar>, "content"> & {
  content: React.ReactNode | null;
}) {
  const isOpen = !!content;

  if (!isOpen) {
    return null;
  }

  return (
    <Sidebar
      {...props}
      collapsible="none"
      side="right"
      className="h-full max-w-[100vw] border-l"
      style={{ "--sidebar-width": "500px" } as React.CSSProperties}
    >
      <SidebarContent className="h-full p-0">{content}</SidebarContent>
    </Sidebar>
  );
}
