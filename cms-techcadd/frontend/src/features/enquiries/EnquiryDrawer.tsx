import { useState, type ReactNode } from 'react'
import { Archive, Check, Mail, MessageCircle, Phone, Send } from 'lucide-react'

import { ApiError } from '../../api'
import { EnquiryStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Drawer } from '../../components/common/Drawer'
import { FormField } from '../../components/form/FormField'
import { Select } from '../../components/form/Select'
import { Textarea } from '../../components/form/Textarea'
import { Spinner } from '../../components/feedback/Spinner'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'
import { createId } from '../../lib/id'
import { formatDateTime, formatShortDate } from '../../lib/format'
import type { EnquiryNote, EnquiryRecord } from '../../types'
import { PIPELINE, statusLabel, whatsAppLink } from './enquiryMeta'
import { enquiryHooks } from './useEnquiries'

interface EnquiryDrawerProps {
  enquiry: EnquiryRecord | null
  /** Opened from a link (?open=<id>) and still being fetched. */
  loading?: boolean
  onOpenChange: (open: boolean) => void
  assigneeOptions: { value: string; label: string }[]
  /** Attributed as the note author. */
  currentUserName: string
}

export function EnquiryDrawer({
  enquiry,
  loading = false,
  onOpenChange,
  assigneeOptions,
  currentUserName,
}: EnquiryDrawerProps) {
  const toast = useToast()
  const update = enquiryHooks.useUpdate()
  const [noteDraft, setNoteDraft] = useState('')

  if (loading) {
    return (
      <Drawer open onOpenChange={onOpenChange} title="Enquiry">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner />
          Loading enquiry…
        </p>
      </Drawer>
    )
  }

  if (!enquiry) return null

  async function patch(input: Parameters<typeof update.mutateAsync>[0]['input'], message: string) {
    if (!enquiry) return false
    try {
      await update.mutateAsync({ id: enquiry.id, input })
      toast.success(message)
      return true
    } catch (error) {
      toast.error('Could not update this enquiry', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
      return false
    }
  }

  async function addNote() {
    const body = noteDraft.trim()
    if (!body || !enquiry) return

    const note: EnquiryNote = {
      id: createId('note'),
      author: currentUserName,
      body,
      createdAt: new Date().toISOString(),
    }

    // Notes are append-only — the API inserts only the entries it does not know.
    if (await patch({ notes: [...enquiry.notes, note] }, 'Note added.')) setNoteDraft('')
  }

  const firstName = enquiry.name.split(' ')[0] || enquiry.name
  const replySubject = enquiry.subject
    ? `Re: ${enquiry.subject}`
    : 'Your enquiry to XAI Robotics'
  const contactMessage = `Hello ${firstName}, thanks for getting in touch with XAI Robotics${
    enquiry.service ? ` about ${enquiry.service}` : ''
  }.`
  const currentIndex = PIPELINE.indexOf(enquiry.status)

  return (
    <Drawer
      open
      onOpenChange={onOpenChange}
      title={enquiry.name}
      description={`${enquiry.company ? `${enquiry.company} · ` : ''}Received ${formatDateTime(enquiry.createdAt)}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(replySubject)}`}>
            <Button variant="secondary" size="sm" icon={Mail}>
              Reply by email
            </Button>
          </a>
          {enquiry.phone && (
            <>
              <a href={`tel:${enquiry.phone.replace(/\s/g, '')}`}>
                <Button variant="secondary" size="sm" icon={Phone}>
                  Call
                </Button>
              </a>
              <a
                href={whatsAppLink(enquiry.phone, contactMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm" icon={MessageCircle}>
                  WhatsApp
                </Button>
              </a>
            </>
          )}
        </div>

        <section aria-label="Enquiry details">
          <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            <Row label="Email">
              <a href={`mailto:${enquiry.email}`} className="break-all hover:text-primary-600">
                {enquiry.email}
              </a>
            </Row>
            {enquiry.phone && (
              <Row label="Phone">
                <a href={`tel:${enquiry.phone.replace(/\s/g, '')}`} className="hover:text-primary-600">
                  {enquiry.phone}
                </a>
              </Row>
            )}
            {enquiry.company && <Row label="Company">{enquiry.company}</Row>}
            <Row label="Service">
              {enquiry.service || <span className="text-slate-400">Not specified</span>}
            </Row>
            {enquiry.subject && <Row label="Subject">{enquiry.subject}</Row>}
            <Row label="Received">{formatDateTime(enquiry.createdAt)}</Row>
          </dl>

          <blockquote className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed whitespace-pre-line text-slate-600">
            {enquiry.message}
          </blockquote>
        </section>

        <section aria-label="Status">
          <h3 className="text-sm font-semibold text-slate-900">Status</h3>

          <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
            {PIPELINE.map((step, index) => {
              const reached = currentIndex >= index && currentIndex !== -1
              const isCurrent = enquiry.status === step

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => patch({ status: step }, `Marked as ${statusLabel(step)}.`)}
                  aria-current={isCurrent ? 'step' : undefined}
                  disabled={isCurrent || update.isPending}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-xs font-medium transition-colors disabled:cursor-default',
                    isCurrent
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : reached
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                  )}
                >
                  {reached && !isCurrent && <Check size={12} className="mr-1 inline" aria-hidden="true" />}
                  {statusLabel(step)}
                </button>
              )
            })}
          </div>

          <div className="mt-2">
            {enquiry.status === 'archived' ? (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => patch({ status: 'read' }, 'Moved back to the inbox.')}
              >
                Restore to inbox
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={Archive}
                fullWidth
                onClick={() => patch({ status: 'archived' }, 'Archived.')}
              >
                Archive
              </Button>
            )}
          </div>
        </section>

        <section aria-label="Assignment">
          <FormField
            label="Assigned to"
            description={
              assigneeOptions.length === 0 ? 'No CMS users exist yet — add them under Team.' : undefined
            }
          >
            <Select
              options={assigneeOptions}
              placeholder="Unassigned"
              value={enquiry.assigneeId ?? ''}
              disabled={assigneeOptions.length === 0}
              // '' rather than undefined: undefined is dropped from the JSON
              // body, so unassigning would silently do nothing.
              onChange={(event) => patch({ assigneeId: event.target.value }, 'Assignment updated.')}
            />
          </FormField>
        </section>

        <section aria-label="Notes">
          <h3 className="text-sm font-semibold text-slate-900">
            Notes
            {enquiry.notes.length > 0 && (
              <span className="ml-1.5 font-normal text-slate-400">({enquiry.notes.length})</span>
            )}
          </h3>

          {enquiry.notes.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              No notes yet. Record what was discussed so the next person has context.
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {enquiry.notes.map((note) => (
                <li key={note.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700">{note.body}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {note.author} · {formatShortDate(note.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-3">
            <FormField label="Add a note" hideLabel>
              <Textarea
                rows={3}
                value={noteDraft}
                maxLength={5000}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="What was discussed?"
              />
            </FormField>

            <Button
              size="sm"
              icon={Send}
              className="mt-2"
              disabled={!noteDraft.trim() || update.isPending}
              onClick={addNote}
            >
              {update.isPending && <Spinner />}
              Add note
            </Button>
          </div>
        </section>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Current status
          <EnquiryStatusBadge status={enquiry.status} />
        </div>
      </div>
    </Drawer>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 px-3 py-2.5">
      <dt className="w-24 shrink-0 text-xs text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}
