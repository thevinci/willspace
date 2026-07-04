import { X } from "lucide-react";
import { toast } from "sonner";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlaceCreateSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const close = () => setRightSidebarContent(null);

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create place</h2>
        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success(
            "Place form UI migrated. Connect reducer/mutation next.",
          );
          close();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="place-name">Name</Label>
          <Input id="place-name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="place-address">Address</Label>
          <Input id="place-address" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="place-city">City</Label>
            <Input id="place-city" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="place-country">Country</Label>
            <Input id="place-country" />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}
