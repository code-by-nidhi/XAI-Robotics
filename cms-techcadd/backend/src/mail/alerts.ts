import { send } from './mailer.js'
import { applicationAlertEmail, enquiryAlertEmail } from './templates.js'
import { alertSettings } from '../modules/settings/settings.repo.js'

/**
 * Tells the team about a new submission from the website.
 *
 * Settings → Email decides where, and whether, per kind. Called after the
 * visitor has their response and never awaited by the request: a slow or
 * failing mail server must not turn a received enquiry into an error page, and
 * the record is already in the CMS either way. Without SMTP the mailer logs the
 * message instead, so this is visible in development too.
 */
export function alertNewEnquiry(enquiry: Parameters<typeof enquiryAlertEmail>[1]): void {
  void (async () => {
    try {
      const settings = await alertSettings()
      if (!settings.sendInquiryAlerts || !settings.alertEmail) return
      await send(enquiryAlertEmail(settings.alertEmail, enquiry))
    } catch (error) {
      console.error('[alerts] enquiry alert not sent:', error)
    }
  })()
}

export function alertNewApplication(application: Parameters<typeof applicationAlertEmail>[1]): void {
  void (async () => {
    try {
      const settings = await alertSettings()
      if (!settings.sendApplicationAlerts || !settings.alertEmail) return
      await send(applicationAlertEmail(settings.alertEmail, application))
    } catch (error) {
      console.error('[alerts] application alert not sent:', error)
    }
  })()
}
