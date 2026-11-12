import {
  BarChart3,
  Briefcase,
  Inbox,
  LayoutGrid,
  Trophy,
  CircleHelp,
  History,
  Images,
  LayoutDashboard,
  Mail,
  Newspaper,
  Search,
  Settings,
  Users,
} from 'lucide-react'

import type { NavSection } from '../types'

/**
 * Single source of truth for the sidebar, the routes and the header title.
 * Adding a module here wires it into all three.
 */
export const navSections: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    id: 'content',
    title: 'Content',
    items: [
      { id: 'blogs', label: 'Blogs', path: '/blogs', icon: Newspaper },
      { id: 'case-studies', label: 'Case Studies', path: '/case-studies', icon: Trophy },
      { id: 'portfolio', label: 'Portfolio', path: '/portfolio', icon: LayoutGrid },
      { id: 'faqs', label: 'FAQ', path: '/faqs', icon: CircleHelp },
    ],
  },
  {
    id: 'careers',
    title: 'Careers',
    items: [
      { id: 'jobs', label: 'Jobs', path: '/jobs', icon: Briefcase },
      // /applications is also where the new-application alert email links to.
      { id: 'applications', label: 'Applications', path: '/applications', icon: Inbox },
    ],
  },
  {
    id: 'engagement',
    title: 'Engagement',
    items: [
      { id: 'enquiries', label: 'Enquiries', path: '/enquiries', icon: Mail },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      // The people who sign in and publish — CMS accounts, not a public
      // "our team" section.
      { id: 'team', label: 'Team', path: '/team', icon: Users },
      { id: 'team-contributions', label: 'Team Contributions', path: '/team-contributions', icon: BarChart3 },
      { id: 'activity-log', label: 'Activity Log', path: '/activity-log', icon: History },
      { id: 'media', label: 'Media Library', path: '/media', icon: Images },
      { id: 'seo', label: 'SEO', path: '/seo', icon: Search },
      { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
]

/** Flattened nav items — handy for route generation and title lookups. */
export const navItems = navSections.flatMap((section) => section.items)

/** Resolves the page title shown in the header for a given pathname. */
export function getPageTitle(pathname: string): string {
  const exact = navItems.find((item) => item.path === pathname)
  if (exact) return exact.label

  // Nested routes (/blogs/new, /blogs/:id/edit) inherit their module title.
  // Longest match wins so a future /blogs/archive/x picks the deeper entry.
  const parent = navItems
    .filter((item) => item.path !== '/' && pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]

  return parent?.label ?? 'Not Found'
}
