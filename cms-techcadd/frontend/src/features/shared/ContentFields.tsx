import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/format'
import { SITE_ICONS, type ContentStatus, type ResultItem } from '../../types'
import { STATUS_OPTIONS } from './statusOptions'

/* ------------------------------------------------------------------ */
/* Ordered list of short strings                                        */
/* ------------------------------------------------------------------ */

interface StringListFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  /** Accessible name for each row, e.g. "Responsibility". */
  itemLabel: string
  placeholder?: string
  addLabel?: string
  maxItems?: number
  /** Per-row errors, keyed by index, from the form state. */
  errors?: (string | undefined)[]
}

/**
 * One input per item, in the order the website prints them.
 *
 * A tag input would lose the order and squash a sentence-long requirement into
 * a chip; these lists are read top to bottom on the site, so they are edited
 * that way.
 */
export function StringListField({
  value,
  onChange,
  itemLabel,
  placeholder,
  addLabel = 'Add item',
  maxItems,
  errors,
}: StringListFieldProps) {
  const atLimit = maxItems !== undefined && value.length >= maxItems
  const listRef = useRef<HTMLOListElement>(null)
  const focusNewRow = useRef(false)

  // The add button keeps focus after a click, so typing straight away went nowhere; move it into the new row.
  useEffect(() => {
    if (!focusNewRow.current) return
    focusNewRow.current = false
    const inputs = listRef.current?.querySelectorAll('input')
    inputs?.[inputs.length - 1]?.focus()
  }, [value.length])

  const set =(index: number, next: string) =>
    onChange(value.map((item, i) => (i === index ? next : item)))
  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ol ref={listRef} className="space-y-2">
          {value.map((item, index) => (
            <li key={index}>
              <div className="flex items-center gap-1.5">
                <span className="w-5 shrink-0 text-right text-xs text-slate-400" aria-hidden="true">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <Input
                    value={item}
                    onChange={(event) => set(index, event.target.value)}
                    placeholder={placeholder}
                    aria-label={`${itemLabel} ${index + 1}`}
                    invalid={Boolean(errors?.[index])}
                  />
                </div>
                <RowButton label={`Move ${itemLabel.toLowerCase()} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)} icon="up" />
                <RowButton label={`Move ${itemLabel.toLowerCase()} ${index + 1} down`} disabled={index === value.length - 1} onClick={() => move(index, 1)} icon="down" />
                <RowButton label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))} icon="remove" />
              </div>
              {errors?.[index] && (
                <p role="alert" className="mt-1 pl-7 text-xs font-medium text-rose-600">
                  {errors[index]}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={Plus}
        disabled={atLimit}
        onClick={() => {
          focusNewRow.current = true
          onChange([...value, ''])
        }}
      >
        {atLimit ? `Limit of ${maxItems} reached` : addLabel}
      </Button>
    </div>
  )
}

function RowButton({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  icon: 'up' | 'down' | 'remove'
}) {
  const Icon = icon === 'up' ? ArrowUp : icon === 'down' ? ArrowDown : Trash2
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40',
        icon === 'remove' ? 'hover:text-rose-600' : 'hover:text-slate-700',
      )}
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Headline results                                                     */
/* ------------------------------------------------------------------ */

interface ResultsFieldProps {
  value: ResultItem[]
  onChange: (value: ResultItem[]) => void
  maxItems?: number
  /** The form's error for the list as a whole. */
  error?: string
}

/** "60%" / "of routine enquiries resolved without an agent" pairs. */
export function ResultsField({ value, onChange, maxItems = 6, error }: ResultsFieldProps) {
  const set = (index: number, patch: Partial<ResultItem>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((row, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-24 shrink-0 sm:w-28">
                <Input
                  value={row.value}
                  onChange={(event) => set(index, { value: event.target.value })}
                  placeholder="60%"
                  aria-label={`Result ${index + 1} figure`}
                  maxLength={40}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  value={row.label}
                  onChange={(event) => set(index, { label: event.target.value })}
                  placeholder="of routine enquiries resolved without an agent"
                  aria-label={`Result ${index + 1} description`}
                  maxLength={160}
                />
              </div>
              <RowButton
                label={`Remove result ${index + 1}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                icon="remove"
              />
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={Plus}
        disabled={value.length >= maxItems}
        onClick={() => onChange([...value, { value: '', label: '' }])}
      >
        {value.length >= maxItems ? `Limit of ${maxItems} reached` : 'Add result'}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Icon                                                                 */
/* ------------------------------------------------------------------ */

const ICON_OPTIONS = SITE_ICONS.map((icon) => ({
  value: icon,
  label: icon.charAt(0).toUpperCase() + icon.slice(1),
}))

/**
 * The website draws its own icon set by name, so the CMS can only offer those
 * names — a lucide picker here would store icons the site cannot render.
 */
export function IconSelect({
  value,
  onChange,
}: {
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <Select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      options={ICON_OPTIONS}
      placeholder="Default icon"
    />
  )
}

/* ------------------------------------------------------------------ */
/* Status and schedule                                                  */
/* ------------------------------------------------------------------ */

interface PublishingFieldsProps {
  status: ContentStatus
  onStatusChange: (status: ContentStatus) => void
  /** datetime-local value. */
  publishAt?: string
  onPublishAtChange: (value: string | undefined) => void
  /** When it first went live, from the saved record. */
  publishedAt?: string
  errors?: { status?: string; publishAt?: string }
}

const STATUS_HINT: Record<ContentStatus, string> = {
  draft: 'Not on the website.',
  published: 'On the website as soon as you save.',
  scheduled: 'Goes on the website by itself at the time below.',
  archived: 'Taken off the website, kept here for the record.',
}

export function PublishingFields({
  status,
  onStatusChange,
  publishAt,
  onPublishAtChange,
  publishedAt,
  errors,
}: PublishingFieldsProps) {
  return (
    <>
      <FormField label="Status" description={STATUS_HINT[status]} error={errors?.status}>
        <Select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ContentStatus)}
          options={STATUS_OPTIONS}
        />
      </FormField>

      {status === 'scheduled' && (
        <FormField
          label="Publish at"
          required
          description="Your local time. At least a minute from now."
          error={errors?.publishAt}
        >
          <Input
            type="datetime-local"
            value={publishAt ?? ''}
            onChange={(event) => onPublishAtChange(event.target.value || undefined)}
          />
        </FormField>
      )}

      {publishedAt && status === 'published' && (
        <p className="text-xs text-slate-500">First published {formatDateTime(publishedAt)}.</p>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Server-side problems                                                 */
/* ------------------------------------------------------------------ */

/**
 * Lists every problem the server reported for the last save.
 *
 * The API's publish check answers with all missing fields at once, keyed for
 * the form. Each is also set on its input, but some sit in a collapsed panel or
 * further down the page, so the whole list is repeated at the top where the
 * editor is looking.
 */
export function SaveProblems({
  problems,
  title = 'This could not be saved yet',
}: {
  problems: Record<string, string> | null
  title?: string
}) {
  if (!problems) return null
  const messages = [...new Set(Object.values(problems))]
  if (messages.length === 0) return null

  return (
    <Alert tone="error" title={title}>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </Alert>
  )
}

/* ------------------------------------------------------------------ */
/* Loading and load failure for an edit form                            */
/* ------------------------------------------------------------------ */

/**
 * What an edit form shows before its record arrives, or when it cannot.
 * Returns null once there is a form to render.
 */
export function FormLoadState({
  isEdit,
  loading,
  error,
  noun,
  backTo,
  backLabel,
}: {
  isEdit: boolean
  loading: boolean
  error: unknown
  noun: string
  backTo: string
  backLabel: string
}) {
  if (!isEdit) return null
  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading {noun}…
      </div>
    )
  }
  if (error) {
    return (
      <Alert tone="error" title={`Could not load this ${noun}`}>
        <p>{error instanceof Error ? error.message : 'Please try again.'}</p>
        <Link to={backTo} className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            {backLabel}
          </Button>
        </Link>
      </Alert>
    )
  }
  return null
}
