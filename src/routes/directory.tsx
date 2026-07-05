import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, Briefcase, Globe, Mail, MapPin, Phone } from "lucide-react";
import { useSpacetimeDB, useSpacetimeDBQuery } from "spacetimedb/tanstack";
import { tables } from "@/module_bindings";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { CategoryCreateSideContent } from "@/components/pages/directory/CategoryCreateSideContent";
import { SAMPLE_PLACES, SAMPLE_WEBSITES } from "@/data/directory";
import { FilterLeftBar } from "@/components/pages/directory/FilterLeftBar";
import { PersonCreateSideContent } from "@/components/pages/directory/PersonCreateSideContent";
import { PlaceCreateSideContent } from "@/components/pages/directory/PlaceCreateSideContent";
import { WebsiteCreateSideContent } from "@/components/pages/directory/WebsiteCreateSideContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStorageUrl } from "@/lib/convex-storage";

type DirectoryPerson = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  profileImage?: string;
  profileImageUrl?: string | null;
};

export const Route = createFileRoute("/directory")({
  component: RouteComponent,
});

function RouteComponent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const { isActive } = useSpacetimeDB();
  const [peopleRows] = useSpacetimeDBQuery(tables.directoryPerson);
  const [imageUrlByStorageId, setImageUrlByStorageId] = useState<
    Record<string, string | null>
  >({});

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(
    "people",
  );
  const [peopleSearchQuery, setPeopleSearchQuery] = useState("");
  const [peopleSortBy, setPeopleSortBy] = useState("name-asc");

  const people = useMemo<DirectoryPerson[]>(() => {
    return peopleRows.map((row) => {
      return {
        id: row.id.toString(),
        firstName: row.firstName,
        lastName: row.lastName,
        company: row.company || undefined,
        title: row.title || undefined,
        email: row.email || undefined,
        phone: row.phone || undefined,
        city: row.city || undefined,
        state: row.state || undefined,
        country: row.country || undefined,
        website: row.website || undefined,
        profileImage: row.profileImage || undefined,
        profileImageUrl: row.profileImage
          ? imageUrlByStorageId[row.profileImage]
          : null,
      };
    });
  }, [peopleRows, imageUrlByStorageId]);

  useEffect(() => {
    const storageIds = Array.from(
      new Set(
        peopleRows
          .map((row) => row.profileImage?.trim())
          .filter((value): value is string => !!value),
      ),
    ).filter((storageId) => !(storageId in imageUrlByStorageId));

    if (storageIds.length === 0) {
      return;
    }

    let cancelled = false;

    const loadUrls = async () => {
      const entries = await Promise.all(
        storageIds.map(async (storageId) => {
          try {
            const url = await getStorageUrl(storageId);
            return [storageId, url] as const;
          } catch {
            return [storageId, null] as const;
          }
        }),
      );

      if (cancelled) {
        return;
      }

      setImageUrlByStorageId((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    };

    void loadUrls();

    return () => {
      cancelled = true;
    };
  }, [peopleRows, imageUrlByStorageId]);

  const filteredPeople = useMemo(() => {
    const query = peopleSearchQuery.trim().toLowerCase();
    const searched = query
      ? people.filter((person) =>
          `${person.firstName} ${person.lastName}`
            .toLowerCase()
            .includes(query),
        )
      : people;

    const sorted = [...searched];
    switch (peopleSortBy) {
      case "name-desc":
        sorted.sort((a, b) =>
          `${b.firstName} ${b.lastName}`.localeCompare(
            `${a.firstName} ${a.lastName}`,
          ),
        );
        break;
      case "name-asc":
      default:
        sorted.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`,
          ),
        );
        break;
    }
    return sorted;
  }, [people, peopleSearchQuery, peopleSortBy]);

  const isPlaces =
    !!selectedCategoryKey && selectedCategoryKey.startsWith("places");
  const isPeople =
    !selectedCategoryKey || selectedCategoryKey.startsWith("people");
  const isWebsites =
    !!selectedCategoryKey && selectedCategoryKey.startsWith("websites");

  return (
    <div className="flex flex-1 min-h-0">
      <FilterLeftBar
        selectedCategoryKey={selectedCategoryKey}
        onSelectCategory={setSelectedCategoryKey}
        onCreateCategory={() =>
          setRightSidebarContent(<CategoryCreateSideContent />)
        }
      />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Directory</h1>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? "Connected to SpacetimeDB"
                : "Disconnected from SpacetimeDB"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                setRightSidebarContent(<PersonCreateSideContent />)
              }
            >
              New Person
            </Button>
            <Button
              variant="outline"
              onClick={() => setRightSidebarContent(<PlaceCreateSideContent />)}
            >
              New Place
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setRightSidebarContent(<WebsiteCreateSideContent />)
              }
            >
              New Website
            </Button>
          </div>
        </div>

        {isPeople && (
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">People</h2>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search people..."
                  value={peopleSearchQuery}
                  onChange={(e) => setPeopleSearchQuery(e.target.value)}
                  className="w-[220px]"
                />

                <Select
                  value={peopleSortBy}
                  onValueChange={(value) =>
                    setPeopleSortBy(value ?? "name-asc")
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredPeople.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPeople.map((person) => (
                  <Card key={person.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14">
                          {person.profileImageUrl && (
                            <AvatarImage
                              src={person.profileImageUrl}
                              alt={`${person.firstName} ${person.lastName}`}
                            />
                          )}
                          <AvatarFallback>
                            {(person.firstName[0] ?? "U").toUpperCase()}
                            {(person.lastName[0] ?? "").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold">
                            {person.firstName} {person.lastName}
                          </h3>

                          {person.title && (
                            <div className="mt-1 flex items-center text-sm text-muted-foreground">
                              <Briefcase className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{person.title}</span>
                            </div>
                          )}

                          {person.company && (
                            <div className="mt-1 flex items-center text-sm text-muted-foreground">
                              <Building2 className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{person.company}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {(person.city || person.state || person.country) && (
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">
                              {[person.city, person.state, person.country]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}

                        {person.email && (
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 shrink-0" />
                            <a
                              href={`mailto:${person.email}`}
                              className="truncate hover:underline"
                            >
                              {person.email}
                            </a>
                          </div>
                        )}

                        {person.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 shrink-0" />
                            <a
                              href={`tel:${person.phone}`}
                              className="truncate hover:underline"
                            >
                              {person.phone}
                            </a>
                          </div>
                        )}

                        {person.website && (
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 shrink-0" />
                            <a
                              href={
                                person.website.startsWith("http")
                                  ? person.website
                                  : `https://${person.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="truncate hover:underline"
                            >
                              {person.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  {people.length === 0
                    ? "No people records yet. Add a person to get started."
                    : "No people match your search."}
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {isPlaces && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Places</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SAMPLE_PLACES.map((place) => (
                <Card key={place.id}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold">{place.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {place.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {place.city}, {place.country}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {isWebsites && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Websites</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SAMPLE_WEBSITES.map((site) => (
                <Card key={site.id}>
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{site.name}</h3>
                      <Badge variant="outline">External</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {site.description}
                    </p>
                    <a
                      href={site.url}
                      className="mt-3 inline-flex text-sm text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {site.url}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
