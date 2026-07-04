import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DIRECTORY_CATEGORIES } from "@/data/directory";

export function PersonCreateSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState("");

  const peopleCategories = DIRECTORY_CATEGORIES.filter((category) =>
    category.key.startsWith("people/"),
  );

  const close = () => setRightSidebarContent(null);

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create person</h2>
        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success(
            "Person form UI migrated. Connect reducer/mutation next.",
          );
          close();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="person-first">First name</Label>
            <Input id="person-first" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="person-last">Last name</Label>
            <Input id="person-last" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="person-company">Company</Label>
          <Input id="person-company" />
        </div>

        <div className="grid gap-2">
          <Label>Main category</Label>
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger
              type="button"
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
                !mainCategory && "text-muted-foreground",
              )}
            >
              {mainCategory
                ? peopleCategories.find(
                    (category) => category.key === mainCategory,
                  )?.name
                : "Select category"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </PopoverTrigger>

            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {peopleCategories.map((category) => (
                      <CommandItem
                        key={category.key}
                        value={category.name}
                        onSelect={() => {
                          setMainCategory(category.key);
                          setCategoryOpen(false);
                        }}
                        style={{
                          paddingLeft: `${(category.level - 1) * 0.8 + 0.5}rem`,
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            category.key === mainCategory
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="person-bio">Bio</Label>
          <Textarea id="person-bio" rows={3} />
        </div>

        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}
