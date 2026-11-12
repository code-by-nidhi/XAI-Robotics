import { Controller, useWatch } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Inbox } from 'lucide-react'

import { AppearsOn } from '../../components/common/AppearsOn'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { DatePicker } from '../../components/form/DatePicker'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { NumberInput } from '../../components/form/NumberInput'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { Select } from '../../components/form/Select'
import { SlugInput } from '../../components/form/SlugInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { SITE_HOST, SITE_PATHS } from '../../config/siteMap'
import { PublishingCard, SeoCard } from '../shared/ContentCards'
import { FormLoadState, SaveProblems, StringListField } from '../shared/ContentFields'
import { itemErrors, listError } from '../shared/saveErrors'
import { useContentForm } from '../shared/useContentForm'
import {
  EMPLOYMENT_OPTIONS,
  emptyJob,
  jobSchema,
  jobToPayload,
  jobToValues,
  WORK_MODE_OPTIONS,
  type JobFormValues,
} from './jobSchema'
import { jobHooks } from './useJobs'

const LISTS = [
  { name: 'responsibilities', title: 'Responsibilities', hint: 'At least one to publish.', itemLabel: 'Responsibility', max: 20 },
  { name: 'requirements', title: 'Requirements', hint: 'At least one to publish.', itemLabel: 'Requirement', max: 20 },
  { name: 'benefits', title: 'Benefits', hint: 'Optional.', itemLabel: 'Benefit', max: 15 },
] as const

export default function JobFormPage() {
  const { id } = useParams<{ id: string }>()
  const { form, isEdit, existing, saving, blocker, problems, onSubmit, publishFor } = useContentForm({
    id,
    hooks: jobHooks,
    resolver: zodResolver(jobSchema),
    defaults: emptyJob(),
    toValues: jobToValues,
    toPayload: jobToPayload,
    listPath: '/jobs',
    noun: 'job',
  })
  const {
    control,
    register,
    formState: { errors, isDirty },
  } = form

  const watched = useWatch({ control }) as Partial<JobFormValues>
  const title = watched.title ?? ''
  const slug = watched.slug ?? ''
  const applications = existing.data?.applications ?? 0

  const loadState = FormLoadState({
    isEdit,
    loading: existing.isLoading,
    error: existing.error,
    noun: 'job',
    backTo: '/jobs',
    backLabel: 'Back to jobs',
  })
  if (loadState) return loadState

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24" noValidate>
      <PageHeader
        title={isEdit ? 'Edit Job' : 'Add Job'}
        breadcrumb={[{ label: 'Jobs', to: '/jobs' }, { label: isEdit ? 'Edit' : 'New' }]}
        actions={
          isEdit && id && applications > 0 ? (
            <Link
              to={`/applications?jobId=${encodeURIComponent(id)}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              <Inbox size={15} aria-hidden="true" />
              {applications} {applications === 1 ? 'application' : 'applications'}
            </Link>
          ) : undefined
        }
      />

      <AppearsOn module="jobs" record={watched} saved={isEdit} />
      <SaveProblems problems={problems} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Role" />
            <CardBody className="space-y-5">
              <FormField label="Job title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="e.g. Senior ML Engineer" />
              </FormField>

              <FormField label="URL slug" required error={errors.slug?.message}>
                <Controller
                  control={control}
                  name="slug"
                  render={({ field }) => (
                    <SlugInput
                      value={field.value}
                      onChange={field.onChange}
                      source={title}
                      autoGenerate={!isEdit}
                      baseUrl={`${SITE_HOST}${SITE_PATHS.jobs}`}
                    />
                  )}
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Department" error={errors.department?.message}>
                  <Input {...register('department')} placeholder="e.g. Engineering" />
                </FormField>
                <FormField label="Location" error={errors.location?.message}>
                  <Input {...register('location')} placeholder="e.g. Chandigarh" />
                </FormField>
                <FormField label="Employment type" error={errors.employmentType?.message}>
                  <Select {...register('employmentType')} options={EMPLOYMENT_OPTIONS} />
                </FormField>
                <FormField label="Work mode" error={errors.workMode?.message}>
                  <Select {...register('workMode')} options={WORK_MODE_OPTIONS} />
                </FormField>
                <FormField label="Experience" error={errors.experience?.message}>
                  <Input {...register('experience')} placeholder="e.g. 3–5 years" />
                </FormField>
                <FormField label="Salary" description="Leave empty to not show one." error={errors.salary?.message}>
                  <Input {...register('salary')} placeholder="e.g. ₹18–24 LPA" />
                </FormField>
              </div>

              <FormField
                label="Summary"
                description="Shown in the openings list. At least 20 characters to publish."
                error={errors.summary?.message}
              >
                <Textarea {...register('summary')} rows={3} maxLength={320} showCount />
              </FormField>

              <FormField label="Description" error={errors.description?.message}>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
                />
              </FormField>
            </CardBody>
          </Card>

          {LISTS.map((list) => (
            <Card flush key={list.name}>
              <CardHeader title={list.title} subtitle={list.hint} />
              <CardBody className="space-y-2">
                <Controller
                  control={control}
                  name={list.name}
                  render={({ field }) => (
                    <StringListField
                      value={field.value}
                      onChange={field.onChange}
                      itemLabel={list.itemLabel}
                      addLabel={`Add ${list.itemLabel.toLowerCase()}`}
                      maxItems={list.max}
                      errors={itemErrors(errors[list.name])}
                    />
                  )}
                />
                {listError(errors[list.name]) && (
                  <p role="alert" className="text-xs font-medium text-rose-600">
                    {listError(errors[list.name])}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <PublishingCard control={control} publishedAt={existing.data?.publishedAt}>
            <FormField
              label="Closing date"
              description="Applications close after this day. Leave empty to keep it open."
              error={errors.closingDate?.message}
            >
              <Controller
                control={control}
                name="closingDate"
                render={({ field }) => (
                  <DatePicker value={field.value || undefined} onChange={(value) => field.onChange(value ?? '')} />
                )}
              />
            </FormField>
            <FormField label="Display order" description="Lower numbers appear first." error={errors.sortOrder?.message}>
              <Controller
                control={control}
                name="sortOrder"
                render={({ field }) => (
                  <NumberInput value={field.value} onChange={(v) => field.onChange(v === '' ? 0 : v)} min={0} max={9999} />
                )}
              />
            </FormField>
          </PublishingCard>

          <SeoCard
            control={control}
            previewUrl={`${SITE_HOST}${SITE_PATHS.jobs}${slug || 'your-slug'}`}
            fallbackTitle={title}
            fallbackDescription={watched.summary}
          />
        </div>
      </div>

      <FormFooter
        onPublish={publishFor(existing.data?.status ?? 'draft')}
        cancelTo="/jobs"
        submitLabel={isEdit ? 'Save changes' : 'Create job'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="job"
      />
    </form>
  )
}
