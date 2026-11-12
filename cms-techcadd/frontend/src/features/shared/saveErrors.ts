import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { ApiError } from '../../api'

/**
 * Maps a failed save onto the form.
 *
 * Field errors (a 422 from validation or from the publish check) are set on
 * their inputs by the dotted path the API uses — "seo.metaTitle" and
 * "results.0.value" are valid react-hook-form paths too. Returns the problems
 * for SaveProblems, or null when the failure was not about fields, in which
 * case the caller shows a toast.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): Record<string, string> | null {
  if (!(error instanceof ApiError) || !error.fieldErrors) return null
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    setError(field as Path<T>, { type: 'server', message })
  }
  return error.fieldErrors
}

/**
 * Per-row messages for a list field, for StringListField.
 *
 * react-hook-form stores an array's errors as a sparse array (with the whole
 * list's own message on the same object), which is awkward to read inline.
 */
export function itemErrors(error: unknown): (string | undefined)[] | undefined {
  if (!Array.isArray(error)) return undefined
  return Array.from(error, (entry: { message?: string } | undefined) => entry?.message)
}

/** The list-level message of an array field — its length or count limit. */
export function listError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined
  const { message, root } = error as { message?: string; root?: { message?: string } }
  return message ?? root?.message
}
