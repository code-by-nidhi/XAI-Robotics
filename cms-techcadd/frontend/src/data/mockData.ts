import { Briefcase, Images, Inbox, LayoutGrid, Mail, PenSquare, Trophy } from 'lucide-react'

import type { QuickAction, WebsiteStatus } from '../types'

/**
 * Structural dashboard configuration.
 *
 * Every record-shaped export has moved to `src/api` — the dashboard reads live
 * counts through `features/dashboard/useDashboard`. What is left here describes
 * the UI itself, not content, so it is not data that could go stale.
 */

/** Navigation shortcuts. */
export const quickActions: QuickAction[] = [
  {
    id: 'add-blog',
    label: 'Write a Blog Post',
    description: 'Publish an article or insight',
    icon: PenSquare,
    path: '/blogs/new',
  },
  {
    id: 'add-case-study',
    label: 'Add a Case Study',
    description: 'Tell the story of a client project',
    icon: Trophy,
    path: '/case-studies/new',
  },
  {
    id: 'add-portfolio',
    label: 'Add Portfolio Item',
    description: 'Showcase delivered work',
    icon: LayoutGrid,
    path: '/portfolio/new',
  },
  {
    id: 'add-job',
    label: 'Post a Job',
    description: 'Open a position on the careers page',
    icon: Briefcase,
    path: '/jobs/new',
  },
  {
    id: 'view-enquiries',
    label: 'View Enquiries',
    description: 'Reply to incoming leads',
    icon: Mail,
    path: '/enquiries',
  },
  {
    id: 'view-applications',
    label: 'Review Applications',
    description: 'Candidates from the careers page',
    icon: Inbox,
    path: '/applications',
  },
  {
    id: 'upload-media',
    label: 'Upload Media',
    description: 'Add images to the library',
    icon: Images,
    path: '/media',
  },
]

/**
 * No uptime monitoring exists, so this reports only what is knowable: the CMS
 * is reachable. `uptime` stays unset rather than inventing a percentage.
 */
export const websiteStatus: WebsiteStatus = {
  label: 'Website Status',
  state: 'online',
  detail: 'All systems operational',
}
