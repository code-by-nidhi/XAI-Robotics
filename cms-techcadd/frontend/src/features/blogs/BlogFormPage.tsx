import { Controller, useWatch } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { AppearsOn } from '../../components/common/AppearsOn'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { SlugInput } from '../../components/form/SlugInput'
import { TagInput } from '../../components/form/TagInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { SITE_HOST, SITE_PATHS } from '../../config/siteMap'
import { BLOG_CATEGORIES } from '../../config/taxonomy'
import { PublishingCard, SeoCard } from '../shared/ContentCards'
import { FormLoadState, SaveProblems } from '../shared/ContentFields'
import { AuthorSelect, CategorySelect, ServiceSelect } from '../shared/RelationPickers'
import { useContentForm } from '../shared/useContentForm'
import {
  blogSchema,
  blogToPayload,
  blogToValues,
  emptyBlog,
  readingTimeMinutes,
  type BlogFormValues,
} from './blogSchema'
import { blogHooks } from './useBlogs'

export default function BlogFormPage() {
  const { id } = useParams<{ id: string }>()
  const { form, isEdit, existing, saving, blocker, problems, onSubmit, publishFor } = useContentForm({
    id,
    hooks: blogHooks,
    resolver: zodResolver(blogSchema),
    defaults: emptyBlog(),
    toValues: blogToValues,
    toPayload: blogToPayload,
    listPath: '/blogs',
    noun: 'article',
  })
  const {
    control,
    register,
    formState: { errors, isDirty },
  } = form

  // Feeds the "where this appears" note — it shows the live URL, which moves
  // with the slug as it is typed.
  const watched = useWatch({ control }) as Partial<BlogFormValues>
  const title = watched.title ?? ''
  const slug = watched.slug ?? ''
  const body = watched.body ?? ''

  const loadState = FormLoadState({
    isEdit,
    loading: existing.isLoading,
    error: existing.error,
    noun: 'article',
    backTo: '/blogs',
    backLabel: 'Back to blogs',
  })
  if (loadState) return loadState

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24" noValidate>
      <PageHeader
        title={isEdit ? 'Edit Article' : 'Add Article'}
        breadcrumb={[{ label: 'Blogs', to: '/blogs' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="blogs" record={watched} saved={isEdit} />
      <SaveProblems problems={problems} title="This article could not be saved yet" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader
              title="Article"
              subtitle={body ? `About ${readingTimeMinutes(body)} min to read` : undefined}
            />
            <CardBody className="space-y-5">
              <FormField label="Title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="e.g. How we built a self-balancing robot" />
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
                      baseUrl={`${SITE_HOST}${SITE_PATHS.blogs}`}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Excerpt"
                description="Shown on article cards and in search results. At least 20 characters to publish."
                error={errors.excerpt?.message}
              >
                <Textarea {...register('excerpt')} rows={3} maxLength={320} showCount />
              </FormField>

              <FormField label="Body" error={errors.body?.message}>
                <Controller
                  control={control}
                  name="body"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <PublishingCard control={control} publishedAt={existing.data?.publishedAt} />

          <Card flush>
            <CardHeader title="Filing" />
            <CardBody className="space-y-5">
              <FormField
                label="Author"
                description="The byline: name and job title from the Team page."
                error={errors.authorId?.message}
              >
                <Controller
                  control={control}
                  name="authorId"
                  render={({ field }) => (
                    <AuthorSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={isEdit ? 'No author' : 'You (whoever creates it)'}
                    />
                  )}
                />
              </FormField>

              <FormField label="Category" error={errors.category?.message}>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <CategorySelect categories={BLOG_CATEGORIES} value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>

              <FormField
                label="Related programme"
                description="The XAI Robotics offering this article is about."
                error={errors.relatedService?.message}
              >
                <Controller
                  control={control}
                  name="relatedService"
                  render={({ field }) => <ServiceSelect value={field.value} onChange={field.onChange} />}
                />
              </FormField>

              <FormField label="Tags" error={errors.tags?.message}>
                <Controller
                  control={control}
                  name="tags"
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} maxTags={20} />
                  )}
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
                render={({ field }) => (
                  <ImageField value={field.value} onChange={field.onChange} aspect="video" />
                )}
              />
            </CardBody>
          </Card>

          <SeoCard
            control={control}
            previewUrl={`${SITE_HOST}${SITE_PATHS.blogs}${slug || 'your-slug'}`}
            fallbackTitle={title}
            fallbackDescription={watched.excerpt}
            keywords
          />
        </div>
      </div>

      <FormFooter
        onPublish={publishFor(existing.data?.status ?? 'draft')}
        cancelTo="/blogs"
        submitLabel={isEdit ? 'Save changes' : 'Create article'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="article"
      />
    </form>
  )
}
