import type { ReactNode } from 'react'
import { Controller, useFormState, type Control, type FieldValues, type Path } from 'react-hook-form'

import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { SeoFields } from '../../components/form/SeoFields'
import type { ContentStatus, SeoFields as SeoValues } from '../../types'
import { PublishingFields } from './ContentFields'

/** The fields a form needs for the shared cards below to bind to it. */
interface PublishableValues extends FieldValues {
  status: ContentStatus
  publishAt?: string
}

type ErrorTree = Record<string, { message?: string } | undefined>

/**
 * The "Publishing" card: status, the schedule when scheduled, and whatever
 * module-specific settings belong beside them (display order, featured…).
 */
export function PublishingCard<T extends PublishableValues>({
  control,
  publishedAt,
  children,
}: {
  control: Control<T>
  publishedAt?: string
  children?: ReactNode
}) {
  const { errors } = useFormState({ control })
  const tree = errors as ErrorTree

  return (
    <Card flush>
      <CardHeader title="Publishing" />
      <CardBody className="space-y-5">
        <Controller
          control={control}
          name={'status' as Path<T>}
          render={({ field: status }) => (
            <Controller
              control={control}
              name={'publishAt' as Path<T>}
              render={({ field: publishAt }) => (
                <PublishingFields
                  status={status.value as ContentStatus}
                  onStatusChange={status.onChange}
                  publishAt={publishAt.value as string | undefined}
                  onPublishAtChange={publishAt.onChange}
                  publishedAt={publishedAt}
                  errors={{ status: tree.status?.message, publishAt: tree.publishAt?.message }}
                />
              )}
            />
          )}
        />
        {children}
      </CardBody>
    </Card>
  )
}

/** The SEO & sharing accordion bound to a form's `seo` object. */
export function SeoCard<T extends FieldValues & { seo: SeoValues }>({
  control,
  previewUrl,
  fallbackTitle,
  fallbackDescription,
  keywords = false,
}: {
  control: Control<T>
  previewUrl: string
  fallbackTitle?: string
  fallbackDescription?: string
  keywords?: boolean
}) {
  const { errors } = useFormState({ control })
  const seo = (errors as Record<string, ErrorTree | undefined>).seo

  return (
    <Controller
      control={control}
      name={'seo' as Path<T>}
      render={({ field }) => (
        <SeoFields
          value={field.value as SeoValues}
          onChange={field.onChange}
          previewUrl={previewUrl}
          fallbackTitle={fallbackTitle}
          fallbackDescription={fallbackDescription}
          keywords={keywords}
          social
          errors={{
            metaTitle: seo?.metaTitle?.message,
            metaDescription: seo?.metaDescription?.message,
            canonicalUrl: seo?.canonicalUrl?.message,
            ogTitle: seo?.ogTitle?.message,
            ogDescription: seo?.ogDescription?.message,
          }}
        />
      )}
    />
  )
}
