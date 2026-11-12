import type { ApplicationStatus, JobApplication } from '../../types'
import { ApiError } from '../types'
import { API_BASE_URL } from '../client'
import { createHttpResource } from '../http/resource'

/** Staff may move an application along and keep notes — nothing else. */
export interface ApplicationUpdate {
  status?: ApplicationStatus
  notes?: string
}

/**
 * Applications arrive from the website's careers form, so there is no create:
 * the generic resource's `create` exists only to satisfy the shared contract
 * and the API answers it with a 404.
 */
export const applicationsApi = createHttpResource<JobApplication, never, ApplicationUpdate>(
  '/applications',
)

/**
 * Downloads the CV through the signed-in session.
 *
 * A plain `<a href>` would work only while the API and the CMS share a cookie
 * scope, and it would show the browser's own error page when the session has
 * expired. Fetching it lets a failure surface as a toast and keeps the file
 * name the server chose.
 */
export async function downloadApplicationCv(id: string, fallbackName: string): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(id)}/cv`, {
      credentials: 'include',
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check that the API is running.')
  }

  if (!response.ok) {
    let message = 'The CV could not be downloaded.'
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // The body was the file or empty; the generic message stands.
    }
    throw new ApiError(response.status, message)
  }

  const disposition = response.headers.get('content-disposition') ?? ''
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackName

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoked on the next tick: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

