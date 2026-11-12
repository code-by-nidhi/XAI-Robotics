import { Briefcase, CircleHelp, Images, Inbox, LayoutGrid, Mail, PenSquare, Settings, Trophy } from 'lucide-react'

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
  // First the three the XAI Robotics homepage reads today.
  {
    id: 'view-enquiries',
    label: 'View Enquiries',
    description: 'Leads from the homepage contact form',
    icon: Mail,
    path: '/enquiries',
  },
  {
    id: 'edit-faqs',
    label: 'Edit FAQs',
    description: 'The homepage’s frequently asked questions',
    icon: CircleHelp,
    path: '/faqs',
  },
  {
    id: 'edit-contact',
    label: 'Update Contact Details',
    description: 'Email, locations and social links on the site',
    icon: Settings,
    path: '/settings',
  },
  {
    id: 'add-blog',
    label: 'Write a Blog Post',
    description: 'Lab news, tutorials and student stories',
    icon: PenSquare,
    path: '/blogs/new',
  },
  {
    id: 'add-case-study',
    label: 'Add a Case Study',
    description: 'A school, college or partner success story',
    icon: Trophy,
    path: '/case-studies/new',
  },
  {
    id: 'add-portfolio',
    label: 'Add Portfolio Item',
    description: 'Showcase a robot build',
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
