import { config } from '../config.js'
import type { Mail } from './mailer.js'

/** Escapes text going into the HTML body — a name is not markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const shell = (heading: string, body: string) => `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.6">
  <h1 style="font-size:18px;margin:0 0 12px">${escapeHtml(heading)}</h1>
  ${body}
  <p style="color:#64748b;font-size:12px;margin-top:24px">
    XAI Robotics CMS · this message was sent automatically, please do not reply.
  </p>
</div>`

const button = (label: string, url: string) => `
  <p style="margin:20px 0">
    <a href="${escapeHtml(url)}"
       style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;
              text-decoration:none;display:inline-block">${escapeHtml(label)}</a>
  </p>`

/** The CMS origin, not the API's — links open screens in the app. */
function cmsUrl(path: string): string {
  const base = config.CORS_ORIGIN.split(',')[0]?.trim() ?? ''
  return `${base}${path}`
}

export function passwordResetEmail(to: string, token: string): Mail {
  const link = cmsUrl(`/reset-password?token=${encodeURIComponent(token)}`)

  const text = [
    'Someone asked to reset the password for this XAI Robotics CMS account.',
    '',
    `Open this link to choose a new one: ${link}`,
    '',
    'The link is valid for one hour and can be used once.',
    'If this was not you, no action is needed — the password is unchanged.',
  ].join('\n')

  return {
    to,
    subject: 'Reset your XAI Robotics CMS password',
    text,
    html: shell(
      'Reset your password',
      `<p>Someone asked to reset the password for this XAI Robotics CMS account.</p>
       ${button('Choose a new password', link)}
       <p style="color:#475569;font-size:13px">
         The link is valid for one hour and can be used once. If this was not you,
         no action is needed — the password is unchanged.
       </p>`,
    ),
  }
}

/** Detail lines as a list, and as plain text, from the same source. */
function details(lines: [string, string | null | undefined][]): { html: string; text: string } {
  const filled = lines.map(([label, value]) => [label, value?.trim() || '-'] as const)
  return {
    html: `<p>${filled.map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`).join('<br>')}</p>`,
    text: filled.map(([label, value]) => `${label}: ${value}`).join('\n'),
  }
}

export function enquiryAlertEmail(
  to: string,
  enquiry: {
    id: string
    name: string
    email: string
    phone?: string | null
    company?: string | null
    service?: string | null
    role?: string | null
    message: string
  },
): Mail {
  const link = cmsUrl(`/enquiries?open=${encodeURIComponent(enquiry.id)}`)
  const facts = details([
    ['From', `${enquiry.name} <${enquiry.email}>`],
    ['Phone', enquiry.phone],
    ['Company', enquiry.company],
    ['I am a', enquiry.role],
    ['Interested in', enquiry.service],
  ])

  return {
    to,
    subject: `New website enquiry from ${enquiry.company || enquiry.name}`,
    text: `${facts.text}\n\n${enquiry.message || '(No message.)'}\n\nOpen in the CMS: ${link}`,
    html: shell(
      'New website enquiry',
      `${facts.html}
       <p style="white-space:pre-wrap">${escapeHtml(enquiry.message || '(No message.)')}</p>
       ${button('Open in the CMS', link)}`,
    ),
  }
}

export function applicationAlertEmail(
  to: string,
  application: { id: string; jobTitle: string; name: string; email: string; phone?: string | null; location?: string | null },
): Mail {
  const link = cmsUrl(`/applications?open=${encodeURIComponent(application.id)}`)
  const facts = details([
    ['Position', application.jobTitle],
    ['From', `${application.name} <${application.email}>`],
    ['Phone', application.phone],
    ['Location', application.location],
  ])

  return {
    to,
    subject: `New application for ${application.jobTitle}`,
    // The CV stays in the CMS: attaching it would copy a private document into
    // every mailbox the alert is forwarded to.
    text: `${facts.text}\n\nThe CV is attached to the application in the CMS.\n\nOpen in the CMS: ${link}`,
    html: shell(
      'New job application',
      `${facts.html}
       <p>The CV is attached to the application in the CMS.</p>
       ${button('Open in the CMS', link)}`,
    ),
  }
}
