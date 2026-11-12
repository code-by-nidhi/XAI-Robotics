import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError } from '../../api'
import { Button } from '../../components/common/Button'
import { Card, CardBody } from '../../components/common/Card'
import { Modal } from '../../components/common/Modal'
import { TabPanel, Tabs } from '../../components/data/Tabs'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonTable } from '../../components/feedback/Skeleton'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { Switch } from '../../components/form/Switch'
import { Textarea } from '../../components/form/Textarea'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import type { SiteSettings } from '../../types'
import { useSettings, useUpdateSettings } from '../seo/useSeo'
import { SecurityTab } from './SecurityTab'

/** The groups the API stores; each tab below edits and saves exactly one. */
type GroupKey = 'general' | 'social' | 'seo' | 'email'
type GroupValues<G extends GroupKey> = SiteSettings[G]

interface FieldSpec<G extends GroupKey> {
  key: keyof GroupValues<G> & string
  label: string
  kind?: 'text' | 'email' | 'url' | 'textarea' | 'switch'
  placeholder?: string
  description?: string
  /** Mirrors the API's limit, so the input stops where the server would refuse. */
  max?: number
  required?: boolean
  wide?: boolean
}

const GENERAL_FIELDS: FieldSpec<'general'>[] = [
  { key: 'siteName', label: 'Company name', required: true, max: 120 },
  { key: 'tagline', label: 'Tagline', max: 200, placeholder: 'e.g. Machines that perceive, reason and move' },
  { key: 'contactEmail', label: 'Contact email', kind: 'email', max: 191, description: 'Shown in the homepage contact section, as a mail link.' },
  { key: 'phone', label: 'Phone', max: 60, description: 'Shown in the contact section when filled in.' },
  { key: 'address', label: 'Address (first location line)', kind: 'textarea', max: 300, wide: true, placeholder: 'e.g. HQ — San Francisco, CA', description: 'Printed as-is in the contact section.' },
  { key: 'city', label: 'City (second location line)', max: 120, placeholder: 'e.g. LAB — Munich, DE', description: 'Printed below the address.' },
  { key: 'hours', label: 'Opening hours', max: 160, placeholder: 'e.g. Mon–Fri, 9:30 am – 6:30 pm', description: 'Shown in the contact section when filled in.' },
  { key: 'responseTime', label: 'Response time', max: 80, placeholder: 'e.g. within 48 hours', description: 'Completes "our team replies …" beside the contact form.' },
]

const SOCIAL_FIELDS: FieldSpec<'social'>[] = [
  { key: 'linkedin', label: 'LinkedIn', kind: 'url', placeholder: 'https://www.linkedin.com/company/…' },
  { key: 'facebook', label: 'Facebook', kind: 'url', placeholder: 'https://www.facebook.com/…' },
  { key: 'x', label: 'X', kind: 'url', placeholder: 'https://x.com/…' },
  { key: 'youtube', label: 'YouTube', kind: 'url', placeholder: 'https://www.youtube.com/@…' },
  { key: 'instagram', label: 'Instagram', kind: 'url', placeholder: 'https://www.instagram.com/…' },
]

const SEO_FIELDS: FieldSpec<'seo'>[] = [
  { key: 'defaultTitle', label: 'Default title', required: true, max: 70, wide: true, description: 'Used for pages without a meta title of their own.' },
  { key: 'defaultDescription', label: 'Default description', kind: 'textarea', required: true, max: 170, wide: true, description: 'Used for pages without a meta description of their own.' },
  { key: 'allowIndexing', label: 'Allow search engines to index the site', kind: 'switch', wide: true, description: 'Off asks search engines to stay away — for a staging copy only.' },
]

const EMAIL_FIELDS: FieldSpec<'email'>[] = [
  { key: 'alertEmail', label: 'Alert email', kind: 'email', max: 191, wide: true, description: 'Where new enquiry and application alerts are sent. Leave empty to send none.' },
  { key: 'sendInquiryAlerts', label: 'Email new enquiries', kind: 'switch', wide: true, description: 'One email per contact-form submission, linking to it here.' },
  { key: 'sendApplicationAlerts', label: 'Email new job applications', kind: 'switch', wide: true, description: 'One email per application, linking to it here.' },
]

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'social', label: 'Social links' },
  { value: 'seo', label: 'SEO defaults' },
  { value: 'email', label: 'Email alerts' },
  { value: 'profile', label: 'Profile' },
  { value: 'security', label: 'Security' },
]

/** Local draft synced from the server copy, with dirty tracking. */
function useDraft<T extends object>(source: T) {
  const [draft, setDraft] = useState<T>(source)
  const [baseline, setBaseline] = useState<T>(source)

  // Re-sync during render rather than in an effect. Query's structural sharing
  // keeps the reference stable unless the data actually changed, so an in-flight
  // edit is only discarded when the server copy genuinely moved on.
  if (baseline !== source) {
    setBaseline(source)
    setDraft(source)
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline)
  return { draft, setDraft, dirty, revert: () => setDraft(baseline) }
}

export default function SettingsPage() {
  const settings = useSettings()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="XAI Robotics’ contact details, social links, search defaults and alert emails"
      />

      {settings.isLoading ? (
        <Card>
          <SkeletonTable rows={5} columns={2} />
        </Card>
      ) : settings.error || !settings.data ? (
        <Alert tone="error" title="Could not load settings">
          {settings.error?.message ?? 'Please try again.'}
        </Alert>
      ) : (
        <SettingsTabs settings={settings.data} />
      )}
    </div>
  )
}

/**
 * The drafts live here rather than in each tab.
 *
 * Radix unmounts an inactive tab, so a draft held inside one would vanish on a
 * tab switch; held here, it survives, and one navigation guard covers every
 * group at once.
 */
function SettingsTabs({ settings }: { settings: SiteSettings }) {
  const [tab, setTab] = useState('general')

  const general = useDraft(settings.general)
  const social = useDraft(settings.social)
  const seo = useDraft(settings.seo)
  const email = useDraft(settings.email)

  const unsaved = TABS.filter((item) => ({ general, social, seo, email })[item.value as GroupKey]?.dirty)
  const blocker = useUnsavedChanges(unsaved.length > 0)

  return (
    <Card flush>
      <Tabs
        value={tab}
        onValueChange={setTab}
        items={TABS.map((item) => ({
          ...item,
          label: unsaved.includes(item) ? `${item.label} •` : item.label,
        }))}
      >
        <TabPanel value="general">
          <GroupForm group="general" fields={GENERAL_FIELDS} state={general} columns={2} />
        </TabPanel>
        <TabPanel value="social">
          <GroupForm
            group="social"
            fields={SOCIAL_FIELDS}
            state={social}
            columns={2}
            intro="An icon appears in the website footer only when its address is filled in, so clearing one removes it rather than leaving a dead link."
          />
        </TabPanel>
        <TabPanel value="seo">
          <GroupForm group="seo" fields={SEO_FIELDS} state={seo} columns={1} />
        </TabPanel>
        <TabPanel value="email">
          <GroupForm group="email" fields={EMAIL_FIELDS} state={email} columns={1} />
        </TabPanel>
        <TabPanel value="profile">
          <ProfileTab profile={settings.profile} />
        </TabPanel>
        <TabPanel value="security">
          <SecurityTab />
        </TabPanel>
      </Tabs>

      <Modal
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.()
        }}
        title="Discard unsaved changes?"
        description={`Unsaved edits in: ${unsaved.map((item) => item.label).join(', ')}.`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => blocker.reset?.()}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={() => blocker.proceed?.()}>
              Discard changes
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Each tab saves on its own — leaving now loses those edits.</p>
      </Modal>
    </Card>
  )
}

interface GroupFormProps<G extends GroupKey> {
  group: G
  fields: FieldSpec<G>[]
  state: ReturnType<typeof useDraft<GroupValues<G>>>
  columns: 1 | 2
  intro?: string
}

function GroupForm<G extends GroupKey>({ group, fields, state, columns, intro }: GroupFormProps<G>) {
  const update = useUpdateSettings()
  const toast = useToast()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { draft, setDraft, dirty, revert } = state

  // The field specs are typed per group; reading by key needs the looser view.
  const values = draft as unknown as Record<string, string | boolean>
  const set = (key: string, value: string | boolean) => {
    setDraft({ ...draft, [key]: value })
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
  }

  async function save() {
    setErrors({})
    try {
      await update.mutateAsync({ [group]: draft })
      toast.success('Settings saved.')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        // The API keys errors by "<group>.<field>".
        const mine: Record<string, string> = {}
        for (const [path, message] of Object.entries(error.fieldErrors)) {
          mine[path.startsWith(`${group}.`) ? path.slice(group.length + 1) : path] = message
        }
        setErrors(mine)
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save settings', {
        description:
          error instanceof ApiError && error.status === 403
            ? 'Only an admin can change site settings.'
            : error instanceof Error
              ? error.message
              : 'Please try again.',
      })
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <CardBody className={columns === 2 ? 'grid max-w-4xl gap-5 lg:grid-cols-2' : 'max-w-2xl space-y-5'}>
        {intro && <p className="text-sm text-slate-500 lg:col-span-2">{intro}</p>}

        {fields.map((field) => {
          const value = values[field.key]
          const error = errors[field.key] || undefined
          const span = field.wide && columns === 2 ? 'lg:col-span-2' : undefined

          if (field.kind === 'switch') {
            return (
              <div key={field.key} className={span}>
                <Switch
                  checked={Boolean(value)}
                  onCheckedChange={(checked) => set(field.key, checked)}
                  label={field.label}
                  description={field.description}
                />
                {error && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
              </div>
            )
          }

          const text = typeof value === 'string' ? value : ''
          return (
            <FormField
              key={field.key}
              label={field.label}
              required={field.required}
              description={field.description}
              error={error}
              className={span}
            >
              {field.kind === 'textarea' ? (
                <Textarea
                  rows={3}
                  value={text}
                  maxLength={field.max}
                  showCount={Boolean(field.max)}
                  onChange={(event) => set(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  type={field.kind === 'email' ? 'email' : field.kind === 'url' ? 'url' : 'text'}
                  value={text}
                  maxLength={field.max}
                  onChange={(event) => set(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </FormField>
          )
        })}
      </CardBody>

      <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
        <Button type="submit" disabled={!dirty || update.isPending}>
          {update.isPending && <Spinner />}
          Save changes
        </Button>
        {dirty && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              revert()
              setErrors({})
            }}
          >
            Revert
          </Button>
        )}
        {dirty && <p className="ml-auto text-xs text-slate-500">Unsaved changes</p>}
      </div>
    </form>
  )
}

/**
 * Who is signed in. Read-only here: the name and email belong to the account,
 * which is edited under Team, not to the site settings.
 */
function ProfileTab({ profile }: { profile: SiteSettings['profile'] }) {
  return (
    <CardBody className="max-w-md space-y-5">
      <FormField label="Name">
        <Input value={profile.name} readOnly disabled />
      </FormField>
      <FormField label="Email">
        <Input type="email" value={profile.email} readOnly disabled />
      </FormField>
      <p className="text-sm text-slate-500">
        To change these, edit your account under{' '}
        <Link to="/team" className="font-medium text-primary-600 hover:text-primary-700">
          Team
        </Link>
        .
      </p>
    </CardBody>
  )
}
