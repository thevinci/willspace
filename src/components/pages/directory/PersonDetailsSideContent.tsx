import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useReducer, useSpacetimeDB } from "spacetimedb/tanstack";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reducers } from "@/module_bindings";

function formatDataJson(dataJson?: string) {
  if (!dataJson) {
    return "{}";
  }

  try {
    return JSON.stringify(JSON.parse(dataJson), null, 2);
  } catch {
    return dataJson;
  }
}

export function PersonDetailsSideContent({
  person,
  firstName,
  lastName,
  dataJson,
}: {
  person: {
    id: string;
    company?: string;
    title?: string;
    bio?: string;
    categoryKey?: string;
    categories?: string[];
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    website?: string;
    profileImage?: string;
  };
  firstName: string;
  lastName: string;
  dataJson?: string;
}) {
  const { setRightSidebarContent } = useSetRightSidebar();
  const { isActive } = useSpacetimeDB();
  const updateDirectoryPerson = useReducer(reducers.updateDirectoryPerson);
  const [jsonValue, setJsonValue] = useState(formatDataJson(dataJson));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isActive) {
      toast.error("Not connected to SpacetimeDB");
      return;
    }

    try {
      setIsSaving(true);
      await updateDirectoryPerson({
        id: BigInt(person.id),
        firstName,
        lastName,
        company: person.company ?? "",
        title: person.title ?? "",
        bio: person.bio ?? "",
        categoryKey: person.categoryKey ?? "",
        categories: person.categories ?? [],
        email: person.email,
        phone: person.phone,
        city: person.city ?? "",
        state: person.state ?? "",
        zip: person.zip ?? "",
        country: person.country ?? "",
        website: person.website ?? "",
        profileImage: person.profileImage ?? "",
        dataJson: jsonValue,
      });
      toast.success("Person details saved");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save person details",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">More details</h2>
          <p className="truncate text-sm text-muted-foreground">
            {firstName} {lastName}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="default"
            size="sm"
            aria-label="Save details as JSON"
            title="Save details as JSON"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close more details"
            onClick={() => setRightSidebarContent(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Textarea
        className="min-h-0 flex-1 resize-none rounded-md bg-muted/50 font-mono text-xs leading-relaxed"
        value={jsonValue}
        onChange={(event) => setJsonValue(event.target.value)}
        aria-label="Person details JSON"
        spellCheck={false}
      />
    </div>
  );
}
