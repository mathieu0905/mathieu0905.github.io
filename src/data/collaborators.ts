export type CollaboratorOrg = "Huawei" | "SMU";

export interface Collaborator {
  name: string;
  org: CollaboratorOrg;
  role?: string;
  links?: { label: string; href: string }[];
}

export const collaborators: Collaborator[] = [
  {
    name: "Wei Ma",
    org: "SMU",
    links: [
      { label: "Google Scholar", href: "https://scholar.google.com/citations?user=ZubTNs0AAAAJ" },
    ],
  },
  { name: "Chi Chen", org: "Huawei" },
  { name: "Han Hu", org: "Huawei" },
  { name: "Bo Sun", org: "Huawei" },
  { name: "Gang Fan", org: "Huawei" },
];

