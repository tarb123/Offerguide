/**
 * The portal's navigation, declared once (Sprint 9, Story 9.2.1).
 *
 * VISIBILITY IS DATA, NOT BRANCHING. Each entry names the permission it needs;
 * the nav renders whatever survives filtering that through the caller's
 * permission set. There is no `if (role === ...)` in any nav component, and
 * permissions.test.ts asserts that no such comparison exists anywhere in src/.
 * Adding an admin-only destination is a line in this file.
 *
 * ONE DECLARATION, EVERY SURFACE. `ModernHeader` renders the same filtered list
 * twice — the desktop bar and the mobile drawer — and both read from here. It
 * used to hold two hardcoded arrays and render each of them twice, which is how
 * a link ends up in one menu and not the other.
 *
 * NO OFFERGUIDE ENTRY, DELIBERATELY. `/offerguide` is still a public route and
 * still reachable by URL and by direct link; it is simply not advertised in the
 * header. navSections.test.ts pins its absence, so re-adding it here fails that
 * test rather than silently changing the menu.
 *
 * WHY `offerguide.wizard.use` GATES PUBLIC LINKS. It reads oddly to gate links
 * everyone can see, but the alternative — an `always visible` escape hatch — is
 * the thing that erodes. Every entry naming a permission means every new entry
 * has to answer "who is this for?", and the public tier holds
 * `offerguide.wizard.use`, so guests see them.
 */

import {
  BookOpen,
  Calculator,
  GraduationCap,
  History,
  Layers3,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "./permissions";

/** Which menu grouping an entry belongs to, mirroring the existing header. */
export type NavGroup = "explore" | "services" | "account";

export type NavEntry = {
  label: string;
  href: string;
  icon: LucideIcon;
  group: NavGroup;
  permission: Permission;
};

export const NAV_SECTIONS: readonly NavEntry[] = [
  // ---- Public tier — visible to guests, and to everyone above them. --------
  {
    label: "Khudi Assessment",
    href: "/khudiassessment",
    icon: Sparkles,
    group: "explore",
    permission: "offerguide.wizard.use",
  },
  {
    label: "Offer Calculator",
    href: "/FinancialOffer",
    icon: Calculator,
    group: "explore",
    permission: "offerguide.wizard.use",
  },
  {
    label: "3D CVs",
    href: "/cv",
    icon: Layers3,
    group: "explore",
    permission: "offerguide.wizard.use",
  },
  {
    label: "Blogs",
    href: "/Blogs/",
    icon: BookOpen,
    group: "explore",
    permission: "offerguide.wizard.use",
  },
  {
    label: "Professional Growth Program",
    href: "/pgp-access",
    icon: GraduationCap,
    group: "services",
    permission: "offerguide.wizard.use",
  },

  // ---- Authenticated tier — registered accounts and admins. ---------------
  {
    // The screen behind this does not exist yet (§7 backlog). The entry is
    // declared so the tier is real and exercised rather than theoretical, and
    // it points at the wizard, which lists a returning candidate's sessions.
    label: "My Evaluations",
    href: "/offerguide",
    icon: History,
    group: "account",
    permission: "offerguide.history.view",
  },

  // ---- Admin tier — admins only. ------------------------------------------
  {
    // The admin config API has no UI by design, and the admin dashboard is a
    // future effort. /api-docs is the tier's only entry for now; adding more is
    // a line here. NOTE: the Swagger page itself is PUBLIC — hiding this link
    // is not access control, and the routes it documents are gated server-side.
    label: "API Contract",
    href: "/api-docs",
    icon: Terminal,
    group: "account",
    permission: "portal.admin.access",
  },
];

export function navEntriesInGroup(
  entries: readonly NavEntry[],
  group: NavGroup
): NavEntry[] {
  return entries.filter((entry) => entry.group === group);
}
