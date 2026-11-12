import { useEffect, useState } from 'react'
import { useForm, type DefaultValues, type FieldValues, type Path, type PathValue, type Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { applyServerErrors } from './saveErrors'

interface ContentHooks<TRecord, TPayload> {
  useOne(id?: string): UseQueryResult<TRecord>
  useCreate(): UseMutationResult<TRecord, Error, TPayload>
  useUpdate(): UseMutationResult<TRecord, Error, { id: string; input: Partial<TPayload> }>
}

interface ContentFormOptions<TRecord, TValues extends FieldValues, TPayload> {
  id?: string
  hooks: ContentHooks<TRecord, TPayload>
  resolver: Resolver<TValues>
  defaults: TValues
  toValues: (record: TRecord) => TValues
  toPayload: (values: TValues) => TPayload
  /** Where Save returns to. */
  listPath: string
  /** "case study" — for the toasts. */
  noun: string
}

/**
 * The load / save / publish cycle every website content form shares.
 *
 * Six modules repeat it exactly — fetch the record, reset the form from it,
 * create or update, map the API's field errors back onto inputs (including the
 * publish check's list of missing fields), guard unsaved changes, and offer a
 * one-click Publish. Written once, a fix to any of those steps reaches all six.
 */
export function useContentForm<
  TRecord,
  TValues extends FieldValues & { status: string },
  TPayload,
>({ id, hooks, resolver, defaults, toValues, toPayload, listPath, noun }: ContentFormOptions<TRecord, TValues, TPayload>) {
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = hooks.useOne(id)
  const create = hooks.useCreate()
  const update = hooks.useUpdate()

  const form = useForm<TValues>({
    resolver,
    defaultValues: defaults as DefaultValues<TValues>,
    mode: 'onBlur',
  })
  const { reset, handleSubmit, setError, setValue, formState } = form

  /** The server's last list of problems, shown at the top of the form. */
  const [problems, setProblems] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    if (existing.data) reset(toValues(existing.data))
    // toValues is a module-level function; only a new record should reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(formState.isDirty && !formState.isSubmitting)
  const saving = create.isPending || update.isPending

  async function submit(values: TValues) {
    setProblems(null)
    const payload = toPayload(values)
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: payload })
        toast.success(`${capitalise(noun)} updated.`)
      } else {
        await create.mutateAsync(payload)
        toast.success(`${capitalise(noun)} created.`)
      }
      // Reset first so the unsaved-changes guard does not stop the redirect.
      reset(values)
      navigate(listPath)
    } catch (error) {
      const fieldProblems = applyServerErrors(error, setError)
      if (fieldProblems) {
        setProblems(fieldProblems)
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error(`Could not save this ${noun}`, {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const onSubmit = handleSubmit(submit)

  /**
   * Publishes and saves in one action — see FormFooter's onPublish. Offered
   * only while the saved status is not already published.
   */
  function publishFor(status: string) {
    if (status === 'published') return undefined
    return () => {
      setValue('status' as Path<TValues>, 'published' as PathValue<TValues, Path<TValues>>, {
        shouldDirty: true,
      })
      void onSubmit()
    }
  }

  return { form, isEdit, existing, saving, blocker, problems, onSubmit, publishFor }
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
