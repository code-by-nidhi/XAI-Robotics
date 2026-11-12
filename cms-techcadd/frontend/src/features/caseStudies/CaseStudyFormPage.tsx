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
import { TagInput } from '../../components/form/TagInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { SITE_HOST, SITE_PATHS } from '../../config/siteMap'
import { CASE_STUDY_CATEGORIES } from '../../config/taxonomy'
import { PublishingCard, SeoCard } from '../shared/ContentCards'
import { FormLoadState, IconSelect, ResultsField, SaveProblems } from '../shared/ContentFields'
import { CategorySelect, ServiceSelect } from '../shared/RelationPickers'
import { useContentForm } from '../shared/useContentForm'
import {
  caseStudySchema,
  caseStudyToPayload,
  caseStudyToValues,
  emptyCaseStudy,
  type CaseStudyFormValues,
} from './caseStudySchema'
import { caseStudyHooks } from './useCaseStudies'

/** The story sections, in the order the case study page prints them. */
const STORY: { name: 'overview' | 'challenge' | 'approach' | 'solution' | 'implementation'; label: string; hint: string }[] = [
  { name: 'overview', label: 'Overview', hint: 'Who the institution or partner is and what they needed.' },
  { name: 'challenge', label: 'Challenge', hint: 'The problem, in their own terms.' },
  { name: 'approach', label: 'Approach', hint: 'How the work was planned.' },
  { name: 'solution', label: 'Solution', hint: 'What was built: the lab, the robots, the curriculum.' },
  { name: 'implementation', label: 'Implementation', hint: 'How it was rolled out.' },
]

export default function CaseStudyFormPage() {
  const { id } = useParams<{ id: string }>()
  const { form, isEdit, existing, saving, blocker, problems, onSubmit, publishFor } = useContentForm({
    id,
    hooks: caseStudyHooks,
    resolver: zodResolver(caseStudySchema),
    defaults: emptyCaseStudy(),
    toValues: caseStudyToValues,
    toPayload: caseStudyToPayload,
    listPath: '/case-studies',
    noun: 'case study',
  })
  const {
    control,
    register,
    formState: { errors, isDirty },
  } = form

  const watched = useWatch({ control }) as Partial<CaseStudyFormValues>
  const title = watched.title ?? ''
  const slug = watched.slug ?? ''

  const loadState = FormLoadState({
    isEdit,
    loading: existing.isLoading,
    error: existing.error,
    noun: 'case study',
    backTo: '/case-studies',
    backLabel: 'Back to case studies',
  })
  if (loadState) return loadState

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24" noValidate>
      <PageHeader
        title={isEdit ? 'Edit Case Study' : 'Add Case Study'}
        breadcrumb={[{ label: 'Case Studies', to: '/case-studies' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="case-studies" record={watched} saved={isEdit} />
      <SaveProblems problems={problems} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Title and summary" />
            <CardBody className="space-y-5">
              <FormField label="Title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="Case study title" />
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
                      baseUrl={`${SITE_HOST}${SITE_PATHS.caseStudies}`}
                    />
                  )}
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Client"
                  description="Can stay anonymous, e.g. “CBSE school, Chandigarh”."
                  error={errors.client?.message}
                >
                  <Input {...register('client')} />
                </FormField>
                <FormField label="Industry" error={errors.industry?.message}>
                  <Input {...register('industry')} placeholder="e.g. School education" />
                </FormField>
              </div>

              <FormField label="Duration" error={errors.duration?.message}>
                <Input {...register('duration')} placeholder="e.g. 6 months" />
              </FormField>

              <FormField
                label="Summary"
                description="Shown on case study cards. At least 20 characters to publish."
                error={errors.excerpt?.message}
              >
                <Textarea
                  {...register('excerpt')}
                  rows={3}
                  maxLength={320}
                  showCount
                  placeholder="One or two sentences on the outcome"
                />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="The story" subtitle="Describe the challenge and what was built before publishing." />
            <CardBody className="space-y-5">
              {STORY.map((section) => (
                <FormField
                  key={section.name}
                  label={section.label}
                  description={section.hint}
                  error={errors[section.name]?.message}
                >
                  <Controller
                    control={control}
                    name={section.name}
                    render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
                  />
                </FormField>
              ))}
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
            <CardHeader title="Testimonial" subtitle="Optional. Shown as a quote on the case study page." />
            <CardBody className="space-y-5">
              <FormField label="Quote" error={errors.testimonialText?.message}>
                <Textarea {...register('testimonialText')} rows={3} maxLength={1000} />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Name"
                  description="Leave empty to keep the person anonymous."
                  error={errors.testimonialName?.message}
                >
                  <Input {...register('testimonialName')} />
                </FormField>
                <FormField label="Role" error={errors.testimonialRole?.message}>
                  <Input {...register('testimonialRole')} placeholder="e.g. Principal" />
                </FormField>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <PublishingCard control={control} publishedAt={existing.data?.publishedAt}>
            <FormField label="Display order" description="Lower numbers appear first on the website." error={errors.sortOrder?.message}>
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
            <CardHeader title="Case study settings" />
            <CardBody className="space-y-5">
              <FormField
                label="Programme"
                description="The XAI Robotics offering this story is about."
                error={errors.serviceSlug?.message}
              >
                <Controller
                  control={control}
                  name="serviceSlug"
                  render={({ field }) => <ServiceSelect value={field.value} onChange={field.onChange} />}
                />
              </FormField>

              <FormField label="Category" error={errors.category?.message}>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <CategorySelect categories={CASE_STUDY_CATEGORIES} value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>

              <FormField label="Technology" description="Press Enter after each one." error={errors.technologies?.message}>
                <Controller
                  control={control}
                  name="technologies"
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} maxTags={20} placeholder="e.g. ROS 2, OpenCV" />
                  )}
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
            previewUrl={`${SITE_HOST}${SITE_PATHS.caseStudies}${slug || 'your-slug'}`}
            fallbackTitle={title}
            fallbackDescription={watched.excerpt}
          />
        </div>
      </div>

      <FormFooter
        onPublish={publishFor(existing.data?.status ?? 'draft')}
        cancelTo="/case-studies"
        submitLabel={isEdit ? 'Save changes' : 'Create case study'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="case study"
      />
    </form>
  )
}
