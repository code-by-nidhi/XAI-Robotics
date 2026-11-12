import { SkeletonCards } from '../components/feedback/Skeleton'
import { WebsiteTraffic } from '../features/analytics/WebsiteTraffic'
import { useDashboardStats } from '../features/dashboard/useDashboard'
import { EnquiriesChart } from '../components/dashboard/EnquiriesChart'
import { QuickActions } from '../components/dashboard/QuickActions'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { RecentEnquiries } from '../components/dashboard/RecentEnquiries'
import { StatCard } from '../components/dashboard/StatCard'
import { WebsiteOverview } from '../components/dashboard/WebsiteOverview'
import { WelcomeSection } from '../components/dashboard/WelcomeSection'

export default function Dashboard() {
  const stats = useDashboardStats()

  return (
    <div className="space-y-6">
      <WelcomeSection />

      <section aria-label="Key statistics">
        {stats.isLoading ? (
          <SkeletonCards count={6} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(stats.data ?? []).map((stat) => (
              <li key={stat.id}>
                <StatCard stat={stat} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <EnquiriesChart />
        </div>
        <WebsiteOverview />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentEnquiries />
        </div>
        <RecentActivity />
      </div>

      <WebsiteTraffic />
    </div>
  )
}
