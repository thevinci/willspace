import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryCreateSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");

  const close = () => setRightSidebarContent(null);

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create category</h2>
        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success(`Category UI captured: ${name || key || "Untitled"}`);
          close();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cat-key">Key</Label>
          <Input
            id="cat-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="people/founders"
          />
        </div>

        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}
