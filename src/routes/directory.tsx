import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Briefcase,
  EllipsisVertical,
  Globe,
  Info,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useReducer, useSpacetimeDBQuery } from "spacetimedb/tanstack";
import { reducers, tables } from "@/module_bindings";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import { CategoryCreateSideContent } from "@/components/pages/directory/CategoryCreateSideContent";
import { FilterLeftBar } from "@/components/pages/directory/FilterLeftBar";
import { PersonCreateSideContent } from "@/components/pages/directory/PersonCreateSideContent";
import { PersonDetailsSideContent } from "@/components/pages/directory/PersonDetailsSideContent";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStorageUrl } from "@/lib/convex-storage";

const DIRECTORY_PAGE_SIZE = 12;

type DirectoryPerson = {
  id: string;
  createdAt: number;
  firstName: string;
  lastName: string;
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
  profileImageUrl?: string | null;
  dataJson?: string;
};

type DirectoryPlace = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
};

type DirectoryWebsite = {
  id: string;
  name: string;
  description?: string;
  url?: string;
};

export const Route = createFileRoute("/directory")({
  component: RouteComponent,
});

function DirectoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const goToPage =
    (page: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onPageChange(page);
    };

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={currentPage === 1}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : undefined
            }
            onClick={goToPage(currentPage - 1)}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                aria-label={`Go to page ${page}`}
                onClick={goToPage(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : undefined
            }
            onClick={goToPage(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function RouteComponent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const deleteDirectoryPerson = useReducer(reducers.deleteDirectoryPerson);
  const [peopleRows] = useSpacetimeDBQuery(tables.directoryPerson);
  const [placeRows] = useSpacetimeDBQuery(tables.directoryPlace);
  const [websiteRows] = useSpacetimeDBQuery(tables.directoryWebsite);
  const [imageUrlByStorageId, setImageUrlByStorageId] = useState<
    Record<string, string | null>
  >({});

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(
    "people",
  );
  const [peopleSearchQuery, setPeopleSearchQuery] = useState("");
  const [peopleSortBy, setPeopleSortBy] = useState("created-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [personToDelete, setPersonToDelete] = useState<DirectoryPerson | null>(
    null,
  );

  const people = useMemo<DirectoryPerson[]>(() => {
    return peopleRows.map((row) => {
      return {
        id: row.id.toString(),
        createdAt: Number(row.created.microsSinceUnixEpoch),
        firstName: row.firstName,
        lastName: row.lastName,
        company: row.company || undefined,
        title: row.title || undefined,
        bio: row.bio || undefined,
        categoryKey: row.categoryKey || undefined,
        categories: row.categories,
        email: row.email || undefined,
        phone: row.phone || undefined,
        city: row.city || undefined,
        state: row.state || undefined,
        zip: row.zip || undefined,
        country: row.country || undefined,
        website: row.website || undefined,
        profileImage: row.profileImage || undefined,
        profileImageUrl: row.profileImage
          ? imageUrlByStorageId[row.profileImage]
          : null,
        dataJson: row.dataJson || undefined,
      };
    });
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
      case "created-desc":
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "created-asc":
        sorted.sort((a, b) => a.createdAt - b.createdAt);
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

  const places = useMemo<DirectoryPlace[]>(() => {
    return placeRows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      country: row.country || undefined,
    }));
  }, [placeRows]);

  const websites = useMemo<DirectoryWebsite[]>(() => {
    return websiteRows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description || undefined,
      url: row.url || undefined,
    }));
  }, [websiteRows]);

  const peopleTotalPages = Math.ceil(
    filteredPeople.length / DIRECTORY_PAGE_SIZE,
  );
  const placesTotalPages = Math.ceil(places.length / DIRECTORY_PAGE_SIZE);
  const websitesTotalPages = Math.ceil(websites.length / DIRECTORY_PAGE_SIZE);

  // Load profile image URLs
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryKey, peopleSearchQuery, peopleSortBy]);

  const peoplePage = Math.min(currentPage, Math.max(peopleTotalPages, 1));
  const placesPage = Math.min(currentPage, Math.max(placesTotalPages, 1));
  const websitesPage = Math.min(currentPage, Math.max(websitesTotalPages, 1));
  const paginatedPeople = filteredPeople.slice(
    (peoplePage - 1) * DIRECTORY_PAGE_SIZE,
    peoplePage * DIRECTORY_PAGE_SIZE,
  );
  const paginatedPlaces = places.slice(
    (placesPage - 1) * DIRECTORY_PAGE_SIZE,
    placesPage * DIRECTORY_PAGE_SIZE,
  );
  const paginatedWebsites = websites.slice(
    (websitesPage - 1) * DIRECTORY_PAGE_SIZE,
    websitesPage * DIRECTORY_PAGE_SIZE,
  );

  const isPlaces =
    !!selectedCategoryKey && selectedCategoryKey.startsWith("places");
  const isPeople =
    !selectedCategoryKey || selectedCategoryKey.startsWith("people");
  const isWebsites =
    !!selectedCategoryKey && selectedCategoryKey.startsWith("websites");

  const handleDeletePerson = async () => {
    if (!personToDelete) {
      return;
    }

    try {
      await deleteDirectoryPerson({ id: BigInt(personToDelete.id) });
      toast.success("Person deleted");
      setPersonToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete person",
      );
    }
  };

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
                    setPeopleSortBy(value ?? "created-desc")
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="created-desc">
                      Created (newest)
                    </SelectItem>
                    <SelectItem value="created-asc">
                      Created (oldest)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredPeople.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedPeople.map((person) => (
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

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="-mr-2 -mt-2 shrink-0"
                                aria-label={`More options for ${person.firstName} ${person.lastName}`}
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setRightSidebarContent(
                                  <PersonDetailsSideContent
                                    person={person}
                                    firstName={person.firstName}
                                    lastName={person.lastName}
                                    dataJson={person.dataJson}
                                  />,
                                )
                              }
                            >
                              <Info />
                              More details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setRightSidebarContent(
                                  <PersonCreateSideContent person={person} />,
                                )
                              }
                            >
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setPersonToDelete(person)}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <DirectoryPagination
              currentPage={peoplePage}
              totalPages={peopleTotalPages}
              onPageChange={setCurrentPage}
            />
            <AlertDialog
              open={!!personToDelete}
              onOpenChange={(open) => !open && setPersonToDelete(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete person?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {personToDelete?.firstName}{" "}
                    {personToDelete?.lastName} from the directory.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDeletePerson}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        )}

        {isPlaces && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Places</h2>
            {places.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {paginatedPlaces.map((place) => (
                  <Card key={place.id}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold">{place.name}</h3>
                      {place.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {place.description}
                        </p>
                      )}
                      {(place.city || place.state || place.country) && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {[place.city, place.state, place.country]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No place records yet. Add a place to get started.
                </CardContent>
              </Card>
            )}
            <DirectoryPagination
              currentPage={placesPage}
              totalPages={placesTotalPages}
              onPageChange={setCurrentPage}
            />
          </section>
        )}

        {isWebsites && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Websites</h2>
            {websites.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {paginatedWebsites.map((site) => (
                  <Card key={site.id}>
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{site.name}</h3>
                        <Badge variant="outline">External</Badge>
                      </div>
                      {site.description && (
                        <p className="text-sm text-muted-foreground">
                          {site.description}
                        </p>
                      )}
                      {site.url && (
                        <a
                          href={
                            site.url.startsWith("http")
                              ? site.url
                              : `https://${site.url}`
                          }
                          className="mt-3 inline-flex text-sm text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {site.url}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No website records yet. Add a website to get started.
                </CardContent>
              </Card>
            )}
            <DirectoryPagination
              currentPage={websitesPage}
              totalPages={websitesTotalPages}
              onPageChange={setCurrentPage}
            />
          </section>
        )}
      </main>
    </div>
  );
}
