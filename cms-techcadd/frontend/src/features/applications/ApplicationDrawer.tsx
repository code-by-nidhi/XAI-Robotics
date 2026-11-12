import { useState } from 'react'
import { Check, Download, ExternalLink, Mail, MapPin, Phone, Trash2 } from 'lucide-react'

import { ApiError, downloadApplicationCv } from '../../api'
import { ApplicationStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Drawer } from '../../components/common/Drawer'
import { FormField } from '../../components/form/FormField'
import { Textarea } from '../../components/form/Textarea'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'
import { formatDateTime, formatFileSize } from '../../lib/format'
import type { ApplicationStatus, JobApplication } from '../../types'
import { OUTCOMES, PIPELINE, applicationStatusLabel } from './applicationMeta'
import { applicationHooks } from './useApplications'

interface ApplicationDrawerProps {
  application: JobApplication
  onClose: () => void
}

/**
 * One application: who, for what, their CV, and where it stands.
 *
 * Remounted per application (keyed by id by the caller), so the notes draft
 * starts from the saved notes without an effect copying props into state.
 */
export function ApplicationDrawer({ application, onClose }: ApplicationDrawerProps) {
  const toast = useToast()
  const confirm = useConfirm()
  const update = applicationHooks.useUpdate()
  const remove = applicationHooks.useRemove()

  const [notes, setNotes] = useState(application.notes ?? '')
  const [downloading, setDownloading] = useState(false)
  const notesDirty = notes !== (application.notes ?? '')

  async function setStatus(status: ApplicationStatus) {
    if (status === application.status) return
    try {
      await update.mutateAsync({ id: application.id, input: { status } })
      toast.success(`Moved to ${applicationStatusLabel(status)}.`)
    } catch (error) {
      toast.error('Could not change the status', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function saveNotes() {
    try {
      await update.mutateAsync({ id: application.id, input: { notes } })
      toast.success('Notes saved.')
    } catch (error) {
      toast.error('Could not save the notes', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function downloadCv() {
    setDownloading(true)
    try {
      await downloadApplicationCv(application.id, application.cv.filename || 'cv')
    } catch (error) {
      toast.error('Could not download the CV', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    } finally {
      setDownloading(false)
    }
  }

  async function deleteApplication() {
    const confirmed = await confirm({
      title: `Delete ${application.name}'s application?`,
      description: 'The CV is deleted with it. This cannot be undone.',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return
    try {
      await remove.mutateAsync([application.id])
      toast.success('Application deleted.')
      onClose()
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  const statusButton = (status: ApplicationStatus) => {
    const active = status === application.status
    return (
      <li key={status}>
        <button
          type="button"
          onClick={() => setStatus(status)}
          disabled={update.isPending}
          aria-pressed={active}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60',
            active
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
          )}
        >
          {active && <Check size={12} aria-hidden="true" />}
          {applicationStatusLabel(status)}
        </button>
      </li>
    )
  }

  return (
    <Drawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={application.name}
      description={`${application.jobTitle} · received ${formatDateTime(application.createdAt)}`}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" icon={Trash2} onClick={deleteApplication} disabled={remove.isPending}>
            Delete
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <ApplicationStatusBadge status={application.status} />
          <Button size="sm" icon={Download} onClick={downloadCv} disabled={downloading}>
            {downloading ? 'Downloading…' : 'Download CV'}
          </Button>
        </div>

        <section aria-labelledby="application-contact">
          <h3 id="application-contact" className="text-sm font-semibold text-slate-900">
            Contact
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" aria-hidden="true" />
              <a href={`mailto:${application.email}`} className="text-primary-700 hover:underline">
                {application.email}
              </a>
            </li>
            {application.phone && (
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" aria-hidden="true" />
                <a href={`tel:${application.phone.replace(/\s/g, '')}`} className="hover:underline">
                  {application.phone}
                </a>
              </li>
            )}
            {application.location && (
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" aria-hidden="true" />
                {application.location}
              </li>
            )}
            {[
              { label: 'LinkedIn', url: application.linkedinUrl },
              { label: 'Portfolio', url: application.portfolioUrl },
            ]
              .filter((link) => link.url)
              .map((link) => (
                <li key={link.label} className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-slate-400" aria-hidden="true" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-primary-700 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            CV: {application.cv.filename || 'Unnamed file'}
            {application.cv.size > 0 && ` · ${formatFileSize(application.cv.size)}`}
          </p>
        </section>

        <section aria-labelledby="application-status">
          <h3 id="application-status" className="text-sm font-semibold text-slate-900">
            Pipeline
          </h3>
          <ol className="mt-2 flex flex-wrap gap-1.5">{PIPELINE.map(statusButton)}</ol>
          <ul className="mt-2 flex flex-wrap gap-1.5">{OUTCOMES.map(statusButton)}</ul>
        </section>

        <section aria-labelledby="application-letter">
          <h3 id="application-letter" className="text-sm font-semibold text-slate-900">
            Cover letter
          </h3>
          {application.coverLetter ? (
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-700">
              {application.coverLetter}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No cover letter was included.</p>
          )}
        </section>

        <section className="space-y-2">
          <FormField label="Internal notes" description="Only visible in the CMS.">
            <Textarea
              rows={5}
              value={notes}
              maxLength={5000}
              showCount
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Interview feedback, next steps…"
            />
          </FormField>
          <div className="flex justify-end">
            <Button size="sm" onClick={saveNotes} disabled={!notesDirty || update.isPending}>
              Save notes
            </Button>
          </div>
        </section>
      </div>
    </Drawer>
  )
}
