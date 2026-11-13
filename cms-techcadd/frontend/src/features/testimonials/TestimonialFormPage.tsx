import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '../../api'
import { AppearsOn } from '../../components/common/AppearsOn'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { NumberInput } from '../../components/form/NumberInput'
import { Select } from '../../components/form/Select'
import { StarRating } from '../../components/form/StarRating'
import { Switch } from '../../components/form/Switch'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import type { Testimonial } from '../../types'
import {
  emptyTestimonial,
  TESTIMONIAL_STATUS_OPTIONS,
  testimonialSchema,
  type TestimonialFormValues,
} from './testimonialSchema'
import { testimonialHooks } from './useTestimonials'

/** The stored record as the form edits it — optional text as '', not absent. */
function toFormValues(record: Testimonial): TestimonialFormValues {
  return {
    name: record.name,
    role: record.role ?? '',
    company: record.company ?? '',
    quote: record.quote,
    rating: record.rating ?? null,
    avatar: record.avatar ?? null,
    featured: record.featured,
    order: record.order ?? 0,
    status: record.status,
  }
}

export default function TestimonialFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = testimonialHooks.useOne(id)
  const create = testimonialHooks.useCreate()
  const update = testimonialHooks.useUpdate()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: emptyTestimonial(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(toFormValues(existing.data))
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)
  const saving = create.isPending || update.isPending

  const watched = useWatch({ control }) as Record<string, unknown>
  const quoteLength = typeof watched.quote === 'string' ? watched.quote.length : 0

  /** Publishes and saves in one action — see the note in FaqFormPage. */
  const publish =
    watched.status === 'published'
      ? undefined
      : () => {
          setValue('status', 'published', { shouldDirty: true })
          void handleSubmit(onSubmit)()
        }

  async function onSubmit(values: TestimonialFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Testimonial updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Testimonial added.')
      }
      navigate('/testimonials')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof TestimonialFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this testimonial', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading testimonial…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this testimonial">
        <p>{(existing.error as Error).message}</p>
        <Link to="/testimonials" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to testimonials
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
        breadcrumb={[{ label: 'Testimonials', to: '/testimonials' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="testimonials" record={watched} saved={isEdit} />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This testimonial could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Who said it" />
            <CardBody className="space-y-5">
              <FormField label="Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Aarav Mehta" />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Role"
                  description="Shown under the name."
                  error={errors.role?.message}
                >
                  <Input {...register('role')} placeholder="e.g. Programme graduate, Batch 2025" />
                </FormField>

                <FormField label="Company or school" error={errors.company?.message}>
                  <Input {...register('company')} placeholder="e.g. Greenfield Public School" />
                </FormField>
              </div>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Testimonial" />
            <CardBody className="space-y-5">
              <FormField
                label="Quote"
                required
                description={`Plain text, up to 600 characters (${quoteLength}/600).`}
                error={errors.quote?.message}
              >
                <Textarea {...register('quote')} rows={5} maxLength={600} />
              </FormField>

              <FormField
                label="Rating"
                description="Optional. Leave it off for quotes that are not reviews, such as a partner's."
                error={errors.rating?.message}
              >
                <Controller
                  control={control}
                  name="rating"
                  render={({ field }) => (
                    <div className="flex flex-wrap items-center gap-3">
                      <StarRating value={field.value ?? 0} onChange={field.onChange} />
                      {field.value ? (
                        <button
                          type="button"
                          onClick={() => field.onChange(null)}
                          className="text-sm font-medium text-primary-700 hover:text-primary-800"
                        >
                          No rating
                        </button>
                      ) : (
                        <span className="text-sm text-slate-500">No rating</span>
                      )}
                    </div>
                  )}
                />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader title="Placement" />
            <CardBody className="space-y-5">
              <FormField label="Status">
                <Select {...register('status')} options={TESTIMONIAL_STATUS_OPTIONS} />
              </FormField>

              <Controller
                control={control}
                name="featured"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    label="Featured"
                    description="Featured testimonials are the homepage's short list."
                  />
                )}
              />

              <FormField
                label="Display order"
                description="Lower numbers come first, on the website too."
                error={errors.order?.message}
              >
                <Controller
                  control={control}
                  name="order"
                  render={({ field }) => (
                    <NumberInput
                      value={field.value ?? 0}
                      onChange={(value) => field.onChange(value === '' ? 0 : value)}
                      min={0}
                      max={9999}
                    />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Photo" />
            <CardBody>
              <Controller
                control={control}
                name="avatar"
                render={({ field }) => (
                  <ImageField value={field.value} onChange={field.onChange} aspect="square" />
                )}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <FormFooter
        onPublish={publish}
        cancelTo="/testimonials"
        submitLabel={isEdit ? 'Save changes' : 'Add testimonial'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="testimonial"
      />
    </form>
  )
}
