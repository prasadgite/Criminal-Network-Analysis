import type { IconName } from "../../types";

export interface NavItem {
  name: string;
  icon: IconName;

  /**
   * Whether this navigation item is currently available.
   *
   * Future system modules can be enabled here when their
   * routes/pages are implemented.
   */
  disabled?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        icon: "home",
      },
    ],
  },

  {
    label: "INVESTIGATION",
    items: [
      {
        name: "Cases",
        icon: "case",
      },
      {
        name: "Entities",
        icon: "person",
      },
      {
        name: "Network Analysis",
        icon: "network",
      },
      {
        name: "Timeline",
        icon: "clock",
      },
      {
        name: "Location Intelligence",
        icon: "pin",
      },
      {
        name: "Findings",
        icon: "report",
      },
      {
        name: "Evidence",
        icon: "evidence",
      },
    ],
  },

  {
    label: "DATA INTELLIGENCE",
    items: [
      {
        name: "Datasets",
        icon: "database",
      },
      {
        name: "Data Upload",
        icon: "upload",
      },
      {
        name: "Data Quality",
        icon: "quality",
      },
      {
        name: "Entity Resolution",
        icon: "link",
      },
    ],
  },

  {
    label: "SYSTEM",
    items: [
      {
        name: "Audit Log",
        icon: "audit",
        disabled: true,
      },
      {
        name: "Users & Access",
        icon: "users",
        disabled: true,
      },
      {
        name: "Settings",
        icon: "settings",
        disabled: true,
      },
    ],
  },
];
