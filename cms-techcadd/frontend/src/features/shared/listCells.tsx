import { Image as ImageIcon } from 'lucide-react'

import { assetUrl } from '../../api/client'
import { formatDateTime, formatShortDate } from '../../lib/format'
import type { MediaRef, Publishable } from '../../types'

/** The 40px cover thumbnail list rows open with, or a neutral placeholder. */
export function CoverThumb({ image }: { image?: MediaRef | null }) {
  if (image) {
    return (
      <img
        src={assetUrl(image.url)}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded object-cover"
      />
    )
  }
  return (
    <span
      className="grid size-10 shrink-0 place-items-center rounded bg-slate-100 text-slate-400"
      aria-hidden="true"
    >
      <ImageIcon size={16} />
    </span>
  )
}

/**
 * When a record went (or goes) live.
 *
 * A scheduled item shows its future time, since "when will this appear?" is
 * the question the list is being read for.
 */
export function PublishedCell({ record }: { record: Publishable }) {
  if (record.status === 'scheduled' && record.publishAt) {
    return <span className="whitespace-nowrap text-primary-700">{formatDateTime(record.publishAt)}</span>
  }
  if (record.publishedAt) {
    return <span className="whitespace-nowrap text-slate-500">{formatShortDate(record.publishedAt)}</span>
  }
  return <span className="text-slate-400">Not yet</span>
}
