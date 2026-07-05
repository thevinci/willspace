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
import { cn } from "@/lib/utils";
import { DIRECTORY_CATEGORIES } from "@/data/directory";
import { reducers } from "@/module_bindings";
import {
  isConvexStorageConfigured,
  uploadFileToConvexStorage,
} from "@/lib/convex-storage";

export function PersonCreateSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const { isActive } = useSpacetimeDB();
  const createDirectoryPerson = useReducer(reducers.createDirectoryPerson);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");

  const peopleCategories = DIRECTORY_CATEGORIES.filter((category) =>
    category.key.startsWith("people/"),
  );

  const close = () => setRightSidebarContent(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isActive) {
      toast.error("Not connected to SpacetimeDB");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      title: title.trim(),
      bio: bio.trim(),
      email: email.trim().toLowerCase() || undefined,
      phone: phone.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country.trim(),
      website: website.trim(),
      categoryKey: mainCategory,
    };

    if (!payload.firstName || !payload.lastName) {
      toast.error("First name and last name are required");
      return;
    }

    try {
      setIsSaving(true);

      let profileImage = "";
      if (selectedImage) {
        if (!isConvexStorageConfigured()) {
          toast.error(
            "Set VITE_CONVEX_SITE_URL or VITE_CONVEX_URL to upload images",
          );
          return;
        }
        profileImage = await uploadFileToConvexStorage(selectedImage);
      }

      await createDirectoryPerson({
        ...payload,
        categories: payload.categoryKey ? [payload.categoryKey] : [],
        profileImage,
        dataJson: "{}",
      });

      toast.success("Person created");
      close();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create person";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create person</h2>
        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="person-image">Profile image</Label>
          <Input
            id="person-image"
            type="file"
            accept="image/*"
            onChange={(event) =>
              setSelectedImage(event.target.files?.[0] ?? null)
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="person-first">First name</Label>
            <Input
              id="person-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="person-last">Last name</Label>
            <Input
              id="person-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="person-company">Company</Label>
            <Input
              id="person-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="person-title">Title</Label>
            <Input
              id="person-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
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
          <Textarea
            id="person-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="person-email">Email</Label>
            <Input
              id="person-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="person-phone">Phone</Label>
            <Input
              id="person-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="person-city">City</Label>
            <Input
              id="person-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="person-state">State</Label>
            <Input
              id="person-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="person-zip">Zip</Label>
            <Input
              id="person-zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="person-country">Country</Label>
            <Input
              id="person-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="person-website">Website</Label>
          <Input
            id="person-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
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
