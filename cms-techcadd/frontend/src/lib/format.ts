/** "08 Aug 2026" — compact table-friendly date. */
export function formatShortDate(isoDate: string): string {
  return parseServerDate(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "1,23,456" — counts, grouped the way the team reads them. */
export function formatCount(value: number): string {
  return value.toLocaleString('en-IN')
}

/** "2.4 MB" — file sizes in the media library and upload fields. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`
}

/** "Saturday, 08 August 2026" — used by the welcome section. */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Reads a timestamp from the API.
 *
 * The database driver returns DATETIME columns as "2026-11-03 10:15:00.000" —
 * local time with a space, which is not ISO and which `new Date` parses only in
 * some browsers. Swapping the space for a T makes it the ISO local form every
 * browser reads the same way. Real ISO strings pass through unchanged.
 */
export function parseServerDate(value: string): Date {
  // A bare date is parsed as UTC midnight by the spec, which is the previous
  // day anywhere west of Greenwich; local midnight is what was meant.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00`)
  return new Date(/^\d{4}-\d{2}-\d{2} \d/.test(value) ? value.replace(' ', 'T') : value)
}

/** "03 Nov 2026, 14:30" — for publish times, where the hour matters. */
export function formatDateTime(value: string): string {
  return parseServerDate(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
