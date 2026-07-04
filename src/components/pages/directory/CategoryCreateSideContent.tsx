import { useState } from "react";
import { X } from "lucide-react";
import { useReducer, useSpacetimeDB } from "spacetimedb/tanstack";
import { toast } from "sonner";
import { reducers } from "@/module_bindings";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeCategoryKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((segment) => segment.trim().replace(/\s+/g, "-"))
    .filter(Boolean)
    .join("/");
}

export function CategoryCreateSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const { isActive } = useSpacetimeDB();
  const createDirectoryCategory = useReducer(reducers.createDirectoryCategory);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [level, setLevel] = useState("0");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const close = () => setRightSidebarContent(null);
  const resetForm = () => {
    setName("");
    setKey("");
    setLevel("0");
    setDescription("");
  };

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
        onSubmit={async (e) => {
          e.preventDefault();

          if (!isActive) {
            toast.error("Not connected to SpacetimeDB");
            return;
          }

          const trimmedName = name.trim();
          const normalizedKey = normalizeCategoryKey(key);

          if (!trimmedName) {
            toast.error("Name is required");
            return;
          }

          if (!normalizedKey) {
            toast.error("Key is required");
            return;
          }

          const parsedLevel = Number.parseInt(level, 10);
          const normalizedLevel = Number.isNaN(parsedLevel)
            ? Math.max(0, normalizedKey.split("/").length - 1)
            : Math.max(0, parsedLevel);

          try {
            setIsSaving(true);
            await createDirectoryCategory({
              key: normalizedKey,
              name: trimmedName,
              description: description.trim(),
              level: normalizedLevel,
            });
            toast.success(`Category created: ${trimmedName}`);
            resetForm();
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to create category";
            toast.error(message);
          } finally {
            setIsSaving(false);
          }
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

        <div className="grid gap-2">
          <Label htmlFor="cat-description">Description</Label>
          <Input
            id="cat-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional summary"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cat-level">Level</Label>
          <Input
            id="cat-level"
            type="number"
            min={0}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="0"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!isActive || isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}
