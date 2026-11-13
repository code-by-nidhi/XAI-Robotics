import { lazy, Suspense, type ReactNode } from 'react'

import { SkeletonTable } from '../components/feedback/Skeleton'

// Split per route. Every form page pulls in the rich text editor, which is far
// too large to sit in the initial bundle.

export const BlogsListPage = lazy(() => import('../features/blogs/BlogsListPage'))
export const BlogFormPage = lazy(() => import('../features/blogs/BlogFormPage'))

export const CaseStudiesListPage = lazy(() => import('../features/caseStudies/CaseStudiesListPage'))
export const CaseStudyFormPage = lazy(() => import('../features/caseStudies/CaseStudyFormPage'))

export const PortfolioListPage = lazy(() => import('../features/portfolio/PortfolioListPage'))
export const PortfolioFormPage = lazy(() => import('../features/portfolio/PortfolioFormPage'))

export const JobsListPage = lazy(() => import('../features/jobs/JobsListPage'))
export const JobFormPage = lazy(() => import('../features/jobs/JobFormPage'))
export const ApplicationsPage = lazy(() => import('../features/applications/ApplicationsPage'))

export const EnquiriesListPage = lazy(() => import('../features/enquiries/EnquiriesListPage'))
export const EnquiriesGate = lazy(() => import('../features/enquiries/EnquiriesGate'))

export const MediaLibraryPage = lazy(() => import('../features/media/MediaLibraryPage'))
export const SeoPage = lazy(() => import('../features/seo/SeoPage'))
export const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))

export const LoginPage = lazy(() => import('../features/auth/LoginPage'))
export const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'))
export const ResetPasswordPage = lazy(() => import('../features/auth/ResetPasswordPage'))

/** Route-level suspense boundary — a skeleton, never a bare spinner. */
export function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SkeletonTable />}>{children}</Suspense>
}

export const FaqsListPage = lazy(() => import('../features/faqs/FaqsListPage'))
export const FaqFormPage = lazy(() => import('../features/faqs/FaqFormPage'))
export const TestimonialsListPage = lazy(() => import('../features/testimonials/TestimonialsListPage'))
export const TestimonialFormPage = lazy(() => import('../features/testimonials/TestimonialFormPage'))
export const TeamContributionsPage = lazy(() => import('../features/activity/TeamContributionsPage'))
export const PersonContributionsPage = lazy(() => import('../features/activity/PersonContributionsPage'))
export const ActivityLogPage = lazy(() => import('../features/activity/ActivityLogPage'))
export const TeamPage = lazy(() => import('../features/team/TeamPage'))
