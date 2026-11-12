import sanitizeHtml from 'sanitize-html'

/**
 * Cleans rich text before it is stored.
 *
 * The website renders these fields as HTML, so whatever is saved here is what
 * runs in a visitor's browser. Cleaning on the way in rather than on the way
 * out means every reader — the site, the public API, a future export — gets the
 * same safe markup without having to remember to clean it themselves.
 *
 * The allow-list of tags and attributes rich text may keep:
 * only the formatting the editor can produce survives. Scripts, event
 * handlers, inline styles and unknown embeds are removed; video embeds are
 * limited to YouTube's players.
 */
const YOUTUBE = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[\w-]{6,20}(\?[\w=&;-]*)?$/

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
      'blockquote', 'pre', 'code', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col',
      'div', 'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      th: ['colspan', 'rowspan', 'colwidth'],
      td: ['colspan', 'rowspan', 'colwidth'],
      col: ['style'],
      code: ['class'],
      ol: ['start'],
      div: ['data-youtube-video'],
      iframe: ['src', 'width', 'height', 'allowfullscreen', 'allow', 'frameborder', 'title'],
    },
    allowedClasses: { code: [/^language-[\w-]+$/] },
    allowedStyles: { col: { 'min-width': [/^\d+px$/], width: [/^\d+px$/] } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    // Relative sources (/uploads/…) still pass: a scheme list only constrains
    // URLs that carry a scheme.
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'],
    exclusiveFilter: (frame) =>
      (frame.tag === 'iframe' && !YOUTUBE.test(frame.attribs.src ?? '')) ||
      (frame.tag === 'img' && !frame.attribs.src) ||
      (frame.tag === 'div' && frame.attribs['data-youtube-video'] !== undefined && !frame.mediaChildren.length),
    transformTags: {
      // External links open in a new tab without handing the site a reference
      // to the opener; internal ones behave like any other link.
      a: (_tag, attribs): sanitizeHtml.Tag => {
        const external = /^https?:\/\//.test(attribs.href ?? '')
        return {
          tagName: 'a',
          attribs: { ...attribs, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : { target: '', rel: '' }) },
        }
      },
      // The editor's YouTube node wraps its iframe in a div; any other div is
      // layout the site does not want, so it becomes a paragraph.
      div: (_tag, attribs): sanitizeHtml.Tag =>
        attribs['data-youtube-video'] !== undefined
          ? { tagName: 'div', attribs: { 'data-youtube-video': '' } }
          : { tagName: 'p', attribs: {} },
    },
  }).replace(/ target="" rel=""/g, '')
}

/** Plain text of rich content, for reading time and "is this empty?" checks. */
export function textOf(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()
}

/** At 220 words a minute, never less than one — "0 min read" reads as broken. */
export function readingMinutes(html: string): number {
  return Math.max(1, Math.round(textOf(html).split(' ').filter(Boolean).length / 220))
}
