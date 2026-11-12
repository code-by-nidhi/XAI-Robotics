import { Controller, useWatch } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { AppearsOn } from '../../components/common/AppearsOn'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { NumberInput } from '../../components/form/NumberInput'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { SlugInput } from '../../components/form/SlugInput'
import { Switch } from '../../components/form/Switch'
import { TagInput } from '../../components/form/TagInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { SITE_HOST, SITE_PATHS } from '../../config/siteMap'
import { PORTFOLIO_CATEGORIES } from '../../config/taxonomy'
import { PublishingCard, SeoCard } from '../shared/ContentCards'
import { FormLoadState, IconSelect, ResultsField, SaveProblems } from '../shared/ContentFields'
import { CaseStudySelect, CategorySelect } from '../shared/RelationPickers'
import { useContentForm } from '../shared/useContentForm'
import {
  emptyPortfolioItem,
  portfolioSchema,
  portfolioToPayload,
  portfolioToValues,
  type PortfolioFormValues,
} from './portfolioSchema'
import { portfolioHooks } from './usePortfolio'

export default function PortfolioFormPage() {
  const { id } = useParams<{ id: string }>()
  const { form, isEdit, existing, saving, blocker, problems, onSubmit, publishFor } = useContentForm({
    id,
    hooks: portfolioHooks,
    resolver: zodResolver(portfolioSchema),
    defaults: emptyPortfolioItem(),
    toValues: portfolioToValues,
    toPayload: portfolioToPayload,
    listPath: '/portfolio',
    noun: 'portfolio item',
  })
  const {
    control,
    register,
    formState: { errors, isDirty },
  } = form

  const watched = useWatch({ control }) as Partial<PortfolioFormValues>
  const title = watched.title ?? ''
  const slug = watched.slug ?? ''

  const loadState = FormLoadState({
    isEdit,
    loading: existing.isLoading,
    error: existing.error,
    noun: 'portfolio item',
    backTo: '/portfolio',
    backLabel: 'Back to portfolio',
  })
  if (loadState) return loadState

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24" noValidate>
      <PageHeader
        title={isEdit ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
        breadcrumb={[{ label: 'Portfolio', to: '/portfolio' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="portfolio" record={watched} saved={isEdit} />
      <SaveProblems problems={problems} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Project" />
            <CardBody className="space-y-5">
              <FormField label="Title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="e.g. Claims triage assistant" />
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
                      baseUrl={`${SITE_HOST}${SITE_PATHS.portfolio}`}
                    />
                  )}
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Client" description="Can stay anonymous." error={errors.client?.message}>
                  <Input {...register('client')} />
                </FormField>
                <FormField label="Industry" error={errors.industry?.message}>
                  <Input {...register('industry')} placeholder="e.g. Insurance" />
                </FormField>
              </div>

              <FormField
                label="Summary"
                description="Shown on the portfolio card. At least 20 characters to publish."
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

          <Card flush>
            <CardHeader title="Results" subtitle="Headline figures, up to six." />
            <CardBody>
              <Controller
                control={control}
                name="results"
                render={({ field }) => (
                  <ResultsField
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.results?.message ?? errors.results?.root?.message}
                  />
                )}
              />
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Delivery" />
            <CardBody className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Duration" error={errors.duration?.message}>
                  <Input {...register('duration')} placeholder="e.g. 3 months" />
                </FormField>
                <FormField label="Team" description="Roles or names. Press Enter after each." error={errors.team?.message}>
                  <Controller
                    control={control}
                    name="team"
                    render={({ field }) => (
                      <TagInput value={field.value} onChange={field.onChange} maxTags={20} placeholder="e.g. ML engineer" />
                    )}
                  />
                </FormField>
              </div>
              <FormField label="Technology" description="Press Enter after each one." error={errors.technologies?.message}>
                <Controller
                  control={control}
                  name="technologies"
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} maxTags={20} placeholder="e.g. Python, Azure" />
                  )}
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Project URL" error={errors.projectUrl?.message}>
                  <Input {...register('projectUrl')} type="url" placeholder="https://…" />
                </FormField>
                <FormField label="GitHub URL" error={errors.githubUrl?.message}>
                  <Input {...register('githubUrl')} type="url" placeholder="https://github.com/…" />
                </FormField>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <PublishingCard control={control} publishedAt={existing.data?.publishedAt}>
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Switch
                  checked={field.value === 'active'}
                  onCheckedChange={(on) => field.onChange(on ? 'active' : 'inactive')}
                  label="Shown on the website"
                  description="Turn off to hide a published item without unpublishing it."
                />
              )}
            />
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Featured"
                  description="Highlighted at the top of the portfolio."
                />
              )}
            />
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

          <Card flush>
            <CardHeader title="Portfolio settings" />
            <CardBody className="space-y-5">
              <FormField
                label="Category"
                required
                description="The portfolio is filtered by category, so one is needed to publish."
                error={errors.category?.message}
              >
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <CategorySelect categories={PORTFOLIO_CATEGORIES} value={field.value} onChange={field.onChange} placeholder="Choose a category" />
                  )}
                />
              </FormField>

              <FormField
                label="Linked case study"
                description="Adds a “Read the case study” link to this item."
                error={errors.caseStudyId?.message}
              >
                <Controller
                  control={control}
                  name="caseStudyId"
                  render={({ field }) => <CaseStudySelect value={field.value} onChange={field.onChange} />}
                />
              </FormField>

              <FormField label="Card icon" error={errors.icon?.message}>
                <Controller
                  control={control}
                  name="icon"
                  render={({ field }) => <IconSelect value={field.value} onChange={field.onChange} />}
                />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Cover image" />
            <CardBody>
              <Controller
                control={control}
                name="coverImage"
                render={({ field }) => <ImageField value={field.value} onChange={field.onChange} aspect="video" />}
              />
            </CardBody>
          </Card>

          <SeoCard
            control={control}
            previewUrl={`${SITE_HOST}${SITE_PATHS.portfolio}${slug || 'your-slug'}`}
            fallbackTitle={title}
            fallbackDescription={watched.summary}
          />
        </div>
      </div>

      <FormFooter
        onPublish={publishFor(existing.data?.status ?? 'draft')}
        cancelTo="/portfolio"
        submitLabel={isEdit ? 'Save changes' : 'Create portfolio item'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="portfolio item"
      />
    </form>
  )
}
