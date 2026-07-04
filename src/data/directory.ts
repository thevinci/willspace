export type DirectoryCategory = {
  key: string;
  name: string;
  level: number;
};

export type DirectoryPlace = {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
};

export type DirectoryWebsite = {
  id: string;
  name: string;
  url: string;
  description: string;
};

export const DIRECTORY_CATEGORIES: DirectoryCategory[] = [
  { key: "people", name: "People", level: 0 },
  { key: "people/founders", name: "Founders", level: 1 },
  { key: "people/operators", name: "Operators", level: 1 },
  { key: "people/creators", name: "Creators", level: 1 },
  { key: "places", name: "Places", level: 0 },
  { key: "places/coworking", name: "Coworking", level: 1 },
  { key: "places/cafes", name: "Cafes", level: 1 },
  { key: "websites", name: "Websites", level: 0 },
  { key: "websites/tools", name: "Tools", level: 1 },
  { key: "websites/communities", name: "Communities", level: 1 },
];

export const SAMPLE_PLACES: DirectoryPlace[] = [
  {
    id: "place-1",
    name: "Dockyard Collective",
    description: "Community coworking with recording booths and event space.",
    city: "Austin",
    country: "USA",
  },
  {
    id: "place-2",
    name: "Northline Studio Cafe",
    description: "Cafe workspace for deep work and meetups.",
    city: "Toronto",
    country: "Canada",
  },
];

export const SAMPLE_WEBSITES: DirectoryWebsite[] = [
  {
    id: "site-1",
    name: "Orbit Directory",
    url: "https://example.com/orbit",
    description: "Tools and people directory for startup operators.",
  },
  {
    id: "site-2",
    name: "Signal Collective",
    url: "https://example.com/signal",
    description: "Community hub for creators, engineers, and founders.",
  },
];
