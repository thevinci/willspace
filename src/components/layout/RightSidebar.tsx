import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";

export function RightSidebar({
  content,
  onClose,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  content: React.ReactNode;
  onClose: () => void;
}) {
  const { setOpen } = useSidebar();
  const isOpen = !!content;

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen, setOpen]);

  return (
    <Sidebar
      {...props}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! max-w-[100vw]"
      style={{ "--sidebar-width": "500px" } as React.CSSProperties}
    >
      <SidebarContent className="p-0">{content}</SidebarContent>
    </Sidebar>
  );
}
