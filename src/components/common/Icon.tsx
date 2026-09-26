import type { ReactNode } from "react";
import type { IconName } from "../../types";

interface IconProps { name: IconName; size?: number; strokeWidth?: number; }

const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
  case: <><path d="M6 4h12v16H6z"/><path d="M9 4V2h6v2M9 9h6M9 13h6"/></>,
  person: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></>,
  network: <><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="m8.3 7 7.2-.2M7.4 8l3.5 7.7M16.7 9l-3.4 6.7"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  report: <><path d="M5 3h11l3 3v15H5z"/><path d="M16 3v4h4M8 12h8M8 16h5"/></>,
  evidence: <><path d="M4 5h16v14H4z"/><path d="m4 9 8 5 8-5M8 5l1-2h6l1 2"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></>,
  upload: <><path d="M12 16V3M7 8l5-5 5 5"/><path d="M4 14v7h16v-7"/></>,
  quality: <><ellipse cx="10" cy="5" rx="7" ry="3"/><path d="M3 5v7c0 1.5 2.8 2.7 6.5 3M3 12v6c0 1.6 3 3 7 3"/><path d="m14 18 2 2 5-6"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></>,
  audit: <><path d="M4 4h16v16H4z"/><path d="M8 16v-4M12 16V8M16 16v-6"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.5-7 6-7s6 3 6 7M16 5a3 3 0 0 1 0 6M17 13c2.5.6 4 3.2 4 6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.8-1.9.9-1.9L15 4l-1.8 1h-2.3L9 4 7 6l.9 1.9-.8 1.9-2 .7v3l2 .7.8 1.9L7 18l2 2 1.9-1h2.3l1.8 1 2.1-2-.9-1.9.8-1.9z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  shield: <><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m8 12 2.5 2.5L16 9"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  mail: <><path d="M3 5h18v14H3z"/><path d="m3 7 9 7 9-7"/></>,
  chevron: <path d="m8 10 4 4 4-4"/>,
  folder: <path d="M3 6h7l2 2h9v11H3z"/>,
  warning: <><path d="M12 3 2 21h20z"/><path d="M12 9v5M12 18h.01"/></>,
  expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></>,
  plus: <path d="M12 5v14M5 12h14"/>, minus: <path d="M5 12h14"/>,
  reset: <><path d="M4 12a8 8 0 1 0 2-5.3L3 10"/><path d="M3 4v6h6"/></>,
  arrow: <><path d="M5 12h14M15 8l4 4-4 4"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
};

export function Icon({ name, size = 18, strokeWidth = 1.8 }: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
