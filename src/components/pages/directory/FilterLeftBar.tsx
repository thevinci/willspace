import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DirectoryCategory } from "@/data/directory";

export function FilterLeftBar({
  categories,
  selectedCategoryKey,
  onSelectCategory,
  onCreateCategory,
}: {
  categories: DirectoryCategory[];
  selectedCategoryKey: string | null;
  onSelectCategory: (key: string | null) => void;
  onCreateCategory: () => void;
}) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(["people", "places", "websites"]),
  );

  const hasChildren = (key: string) =>
    categories.some((cat) => cat.key.startsWith(`${key}/`));

  const isVisible = (category: DirectoryCategory) => {
    const parts = category.key.split("/");
    if (parts.length <= 1) {
      return true;
    }

    let current = "";
    for (let i = 0; i < parts.length - 1; i += 1) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      if (!expandedKeys.has(current)) {
        return false;
      }
    }
    return true;
  };

  return (
    <aside className="w-72 shrink-0 border-r p-4 overflow-y-auto">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Categories
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateCategory}
          aria-label="Create category"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ul className="space-y-1">
        {categories.filter(isVisible).map((category) => {
          const open = expandedKeys.has(category.key);
          const hasKids = hasChildren(category.key);
          const active = selectedCategoryKey === category.key;

          return (
            <li key={category.key}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/60",
                )}
                style={{ paddingLeft: `${category.level * 0.9 + 0.5}rem` }}
                onClick={() => {
                  if (hasKids) {
                    setExpandedKeys((prev) => {
                      const next = new Set(prev);
                      if (next.has(category.key)) {
                        next.delete(category.key);
                      } else {
                        next.add(category.key);
                      }
                      return next;
                    });
                  }
                  onSelectCategory(category.key);
                }}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground">
                  {hasKids ? (
                    open ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )
                  ) : (
                    <span className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="truncate">{category.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
