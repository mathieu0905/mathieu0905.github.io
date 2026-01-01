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
      // TODO: replace with Wei Ma's personal Google Scholar URL
      { label: "Google Scholar (search)", href: "https://scholar.google.com/scholar?q=Wei+Ma+Singapore+Management+University" },
    ],
  },
  { name: "Chi Chen", org: "Huawei" },
  { name: "Han Hu", org: "Huawei" },
  { name: "Bo Sun", org: "Huawei" },
  { name: "Gang Fan", org: "Huawei" },
];

