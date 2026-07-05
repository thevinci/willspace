import { type FormEvent, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { useReducer, useSpacetimeDB } from "spacetimedb/tanstack";
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
import { DIRECTORY_CATEGORIES } from "@/data/directory";
import { cn } from "@/lib/utils";
import { reducers } from "@/module_bindings";

export function PlaceCreateSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const { isActive } = useSpacetimeDB();
  const createDirectoryPlace = useReducer(reducers.createDirectoryPlace);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const placeCategories = DIRECTORY_CATEGORIES.filter((category) =>
    category.key.startsWith("places/"),
  );

  const close = () => setRightSidebarContent(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isActive) {
      toast.error("Not connected to SpacetimeDB");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      website: website.trim(),
      categoryKey: mainCategory,
    };

    if (!payload.name) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsSaving(true);

      await createDirectoryPlace({
        name: payload.name,
        categoryKey: payload.categoryKey,
        categories: payload.categoryKey ? [payload.categoryKey] : [],
        description: payload.description,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        zip: payload.zip,
        country: payload.country,
        phone: payload.phone,
        email: payload.email,
        website: payload.website,
        profileImage: "",
        dataJson: "{}",
      });

      toast.success("Place created");
      close();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create place";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create place</h2>
        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="place-name">Name</Label>
          <Input
            id="place-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
                ? placeCategories.find(
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
                    {placeCategories.map((category) => (
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
          <Label htmlFor="place-description">Description</Label>
          <Textarea
            id="place-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="place-address">Address</Label>
          <Input
            id="place-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="place-city">City</Label>
            <Input
              id="place-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="place-state">State</Label>
            <Input
              id="place-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="place-zip">Zip</Label>
            <Input
              id="place-zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="place-country">Country</Label>
            <Input
              id="place-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="place-email">Email</Label>
            <Input
              id="place-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="place-phone">Phone</Label>
            <Input
              id="place-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="place-website">Website</Label>
          <Input
            id="place-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSaving || !isActive}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}
