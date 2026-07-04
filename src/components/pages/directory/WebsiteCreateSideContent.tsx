import { X } from "lucide-react";
import { toast } from "sonner";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WebsiteCreateSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const close = () => setRightSidebarContent(null);

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create website</h2>
        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success(
            "Website form UI migrated. Connect reducer/mutation next.",
          );
          close();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="site-name">Name</Label>
          <Input id="site-name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="site-url">URL</Label>
          <Input id="site-url" placeholder="https://" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="site-description">Description</Label>
          <Textarea id="site-description" rows={3} />
        </div>
        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}
