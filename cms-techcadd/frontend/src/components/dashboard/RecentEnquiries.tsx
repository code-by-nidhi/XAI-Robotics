import { Link } from 'react-router-dom'
import { Eye, Inbox, Lock } from 'lucide-react'

import { useEnquiriesLock } from '../../features/enquiries/useEnquiriesLock'
import { useRecentEnquiries } from '../../features/dashboard/useDashboard'
import { formatShortDate } from '../../lib/format'
import type { EnquiryRecord } from '../../types'
import { EnquiryStatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card, CardHeader } from '../common/Card'
import { EmptyState } from '../common/EmptyState'

const columns = ['Name', 'Email', 'Service', 'Status', 'Date', 'Action'] as const

export function RecentEnquiries() {
  const { checking, unlocked } = useEnquiriesLock()
  const { data } = useRecentEnquiries()
  const recentEnquiries = data?.items ?? []

  // The API withholds rows entirely while enquiries are locked, so an empty
  // list here means "locked", not "no enquiries yet" — say so, rather than
  // showing a beginner's empty state for a widget that is actually gated.
  const locked = !checking && !unlocked

  return (
    <Card flush>
      <CardHeader
        title="Recent Enquiries"
        subtitle="Latest enquiries from the website"
        action={
          <Link to="/enquiries">
            <Button variant="secondary" size="sm">
              View all
            </Button>
          </Link>
        }
      />

      {locked ? (
        <EmptyState
          icon={Lock}
          title="Enquiries are locked"
          description="Open Enquiries and enter the password to see recent leads here."
        />
      ) : recentEnquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No enquiries yet"
          description="Enquiries submitted through the website will land here."
        />
      ) : (
        <EnquiriesTable rows={recentEnquiries} />
      )}
    </Card>
  )
}

/** Horizontal scroll keeps every column readable on small screens. */
function EnquiriesTable({ rows }: { rows: EnquiryRecord[] }) {
  return (
      <div className="scrollbar-slim overflow-x-auto">
        <table className="w-full min-w-215 border-collapse text-left text-sm">
          <caption className="sr-only">
            The most recent enquiries with their current status
          </caption>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((enquiry) => (
              <tr
                key={enquiry.id}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/60"
              >
                <th scope="row" className="px-5 py-3.5 text-left font-medium text-slate-900">
                  {enquiry.name}
                  {enquiry.company && (
                    <span className="mt-0.5 block text-xs font-normal text-slate-400">
                      {enquiry.company}
                    </span>
                  )}
                </th>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                  <a href={`mailto:${enquiry.email}`} className="hover:text-primary-600">
                    {enquiry.email}
                  </a>
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {enquiry.service || <span className="text-slate-400">Not specified</span>}
                </td>
                <td className="px-5 py-3.5">
                  <EnquiryStatusBadge status={enquiry.status} />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                  {formatShortDate(enquiry.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  {/* A link, so it lands on the enquiry's drawer rather than the top of the list. */}
                  <Link
                    to={`/enquiries?open=${encodeURIComponent(enquiry.id)}`}
                    aria-label={`View enquiry from ${enquiry.name}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Eye size={14} aria-hidden="true" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  )
}
