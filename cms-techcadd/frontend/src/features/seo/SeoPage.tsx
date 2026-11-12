import { useState } from 'react'
import { ArrowRight, Bot, Link2, Map, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card, CardBody } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { Modal } from '../../components/common/Modal'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar } from '../../components/data/FilterBar'
import { TabPanel, Tabs } from '../../components/data/Tabs'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonTable } from '../../components/feedback/Skeleton'
import { Spinner } from '../../components/feedback/Spinner'
import { Checkbox } from '../../components/form/Checkbox'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { Switch } from '../../components/form/Switch'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { formatShortDate } from '../../lib/format'
import type { Redirect } from '../../types'
import { redirectHooks, useSettings, useSitemap, useUpdateSettings } from './useSeo'

const TABS = [
  { value: 'sitemap', label: 'Sitemap' },
  { value: 'redirects', label: 'Redirects' },
  { value: 'robots', label: 'Indexing' },
]

export default function SeoPage() {
  const [tab, setTab] = useState('sitemap')

  return (
    <div className="space-y-6">
      <PageHeader title="SEO" description="How the website presents itself to search engines" />

      <Card flush>
        <Tabs value={tab} onValueChange={setTab} items={TABS}>
          <TabPanel value="sitemap">
            <SitemapTab />
          </TabPanel>
          <TabPanel value="redirects">
            <RedirectsTab />
          </TabPanel>
          <TabPanel value="robots">
            <RobotsTab />
          </TabPanel>
        </Tabs>
      </Card>
    </div>
  )
}

function SitemapTab() {
  const query = useSitemap()
  const [search, setSearch] = useState('')

  const all = query.data ?? []
  const term = search.trim().toLowerCase()
  const entries = term
    ? all.filter((entry) => `${entry.path} ${entry.type}`.toLowerCase().includes(term))
    : all

  if (query.isLoading) return <SkeletonTable rows={5} columns={3} />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <p className="text-sm text-slate-500">
          {all.length} published {all.length === 1 ? 'URL' : 'URLs'}, built from live content
        </p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => query.refetch()}>
          Rebuild
        </Button>
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search URLs" />

      {entries.length === 0 ? (
        <EmptyState
          icon={Map}
          title={term ? 'No matching URLs' : 'Nothing published yet'}
          description={
            term
              ? 'Try a different search term.'
              : 'Published articles appear here automatically.'
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <li key={entry.path} className="flex items-center gap-3 px-5 py-3">
              <Badge tone="neutral">{entry.type}</Badge>
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                {entry.path}
              </span>
              <span className="shrink-0 text-xs text-slate-400">
                {formatShortDate(entry.updatedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RedirectsTab() {
  const toast = useToast()
  const confirm = useConfirm()

  const query = redirectHooks.useList({ page: 1, pageSize: 200 })
  const create = redirectHooks.useCreate()
  const update = redirectHooks.useUpdate()
  const remove = redirectHooks.useRemove()

  const [editing, setEditing] = useState<Redirect | 'new' | null>(null)
  const [form, setForm] = useState({ from: '', to: '', type: '301', enabled: true })
  const [error, setError] = useState<string | undefined>()
  const [search, setSearch] = useState('')

  const term = search.trim().toLowerCase()
  const redirects = (query.data?.items ?? []).filter(
    (redirect) => !term || `${redirect.from} ${redirect.to}`.toLowerCase().includes(term),
  )

  function openEditor(redirect: Redirect | 'new') {
    setEditing(redirect)
    setError(undefined)
    setForm(
      redirect === 'new'
        ? { from: '', to: '', type: '301', enabled: true }
        : {
            from: redirect.from,
            to: redirect.to,
            type: String(redirect.type),
            enabled: redirect.enabled,
          },
    )
  }

  async function save() {
    const input = {
      from: form.from.trim(),
      to: form.to.trim(),
      type: Number(form.type) as 301 | 302,
      enabled: form.enabled,
    }

    if (!input.from || !input.to) {
      setError('Both the source and destination paths are required.')
      return
    }
    // A redirect pointing at itself is an infinite loop on the live site.
    if (input.from === input.to) {
      setError('The source and destination cannot be the same path.')
      return
    }

    try {
      if (editing === 'new') await create.mutateAsync(input)
      else if (editing) await update.mutateAsync({ id: editing.id, input })

      toast.success('Redirect saved.')
      setEditing(null)
    } catch (caught) {
      if (caught instanceof ApiError && caught.fieldErrors?.from) {
        setError(caught.fieldErrors.from)
        return
      }
      toast.error('Could not save this redirect')
    }
  }

  async function deleteRedirect(redirect: Redirect) {
    const confirmed = await confirm({
      title: `Delete the redirect from ${redirect.from}?`,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([redirect.id])
      toast.success('Redirect deleted.')
    } catch {
      toast.error('Could not delete this redirect')
    }
  }

  const columns: Column<Redirect>[] = [
    {
      id: 'from',
      header: 'From',
      primary: true,
      cell: (row) => (
        <span className="flex items-center gap-2 font-mono text-xs">
          <span className="truncate text-slate-700">{row.from}</span>
          <ArrowRight size={12} className="shrink-0 text-slate-300" aria-hidden="true" />
          <span className="truncate text-slate-500">{row.to}</span>
        </span>
      ),
    },
    { id: 'type', header: 'Type', cell: (row) => <Badge tone="neutral">{row.type}</Badge> },
    {
      id: 'enabled',
      header: 'Status',
      cell: (row) => (
        <Badge tone={row.enabled ? 'success' : 'neutral'} withDot>
          {row.enabled ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <p className="text-sm text-slate-500">
          Send old URLs to their replacement so existing links keep working
        </p>
        <Button size="sm" icon={Plus} onClick={() => openEditor('new')}>
          Add redirect
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by old or new path"
      />

      <DataTable
        rows={redirects}
        columns={columns}
        getRowId={(row) => row.id}
        caption="URL redirects with their type and status"
        loading={query.isLoading}
        error={query.error as Error | null}
        onRetry={() => query.refetch()}
        emptyIcon={Link2}
        emptyTitle={term ? 'No matching redirects' : 'No redirects yet'}
        emptyDescription={
          term ? 'Try a different path.' : 'Add one whenever a page changes its URL.'
        }
        rowActions={(row) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={Pencil}
              aria-label={`Edit redirect from ${row.from}`}
              onClick={() => openEditor(row)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              aria-label={`Delete redirect from ${row.from}`}
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => deleteRedirect(row)}
            />
          </div>
        )}
      />

      <Modal
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === 'new' ? 'Add redirect' : 'Edit redirect'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={create.isPending || update.isPending} onClick={save}>
              {(create.isPending || update.isPending) && <Spinner />}
              Save redirect
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <FormField label="From" required description="The old path, e.g. /old-service">
            <Input
              value={form.from}
              onChange={(event) => setForm({ ...form, from: event.target.value })}
              placeholder="/old-path"
              className="font-mono text-xs"
            />
          </FormField>

          <FormField label="To" required description="Where it should go instead">
            <Input
              value={form.to}
              onChange={(event) => setForm({ ...form, to: event.target.value })}
              placeholder="/blog/new-path"
              className="font-mono text-xs"
            />
          </FormField>

          <FormField label="Type" description="301 is permanent; 302 is temporary.">
            <Select
              options={[
                { value: '301', label: '301 — Permanent' },
                { value: '302', label: '302 — Temporary' },
              ]}
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            />
          </FormField>

          <Checkbox
            checked={form.enabled}
            onCheckedChange={(enabled) => setForm({ ...form, enabled })}
            label="Active"
            description="Disable to keep the rule without applying it."
          />
        </div>
      </Modal>
    </div>
  )
}

/**
 * Search engine access, as one switch.
 *
 * The website writes its own robots.txt and meta robots tags from
 * seo.allowIndexing, so there is no file to edit here — only the decision.
 * Turning it off is what a staging copy wants and what a live site never does,
 * so it asks first.
 */
function RobotsTab() {
  const settings = useSettings()
  const update = useUpdateSettings()
  const toast = useToast()
  const confirm = useConfirm()

  if (settings.isLoading) return <SkeletonTable rows={2} columns={1} />
  if (settings.error || !settings.data) {
    return (
      <CardBody>
        <Alert tone="error" title="Could not load the indexing setting">
          {settings.error?.message ?? 'Please try again.'}
        </Alert>
      </CardBody>
    )
  }

  const allowed = settings.data.seo.allowIndexing

  async function setAllowed(next: boolean) {
    if (!next) {
      const confirmed = await confirm({
        title: 'Hide the whole site from search engines?',
        description:
          'Google and others will be asked to drop every page from their results. Only do this on a staging or private copy of the site.',
        confirmLabel: 'Hide from search',
      })
      if (!confirmed) return
    }
    try {
      await update.mutateAsync({ seo: { allowIndexing: next } })
      toast.success(next ? 'Search engines may index the site.' : 'The site is hidden from search engines.')
    } catch (error) {
      toast.error('Could not change search engine access', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <CardBody className="max-w-2xl space-y-4">
      {allowed ? (
        <Alert tone="success" title="Search engines may index the site">
          robots.txt allows crawling, and pages are listed unless a page sets its own
          &ldquo;Hide from search engines&rdquo; switch.
        </Alert>
      ) : (
        <Alert tone="warning" title="The site is hidden from search engines">
          robots.txt disallows crawling and every page carries a noindex tag. New visitors will not
          find the site through search.
        </Alert>
      )}

      <Switch
        checked={allowed}
        disabled={update.isPending}
        onCheckedChange={(next) => void setAllowed(next)}
        label="Allow search engines to index the site"
        description="Also editable under Settings → SEO defaults."
      />

      <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <Bot size={14} aria-hidden="true" />
        The website serves /robots.txt from this setting.
      </p>
    </CardBody>
  )
}
