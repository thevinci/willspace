import { X } from "lucide-react";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { Button } from "@/components/ui/button";

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
  firstName,
  lastName,
  dataJson,
}: {
  firstName: string;
  lastName: string;
  dataJson?: string;
}) {
  const { setRightSidebarContent } = useSetRightSidebar();

  return (
    <div className="flex h-full min-h-0 flex-col p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">More details</h2>
          <p className="truncate text-sm text-muted-foreground">
            {firstName} {lastName}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close more details"
          onClick={() => setRightSidebarContent(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <pre className="min-h-0 flex-1 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
        {formatDataJson(dataJson)}
      </pre>
    </div>
  );
}
