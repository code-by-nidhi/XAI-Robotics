import { cn } from '../../lib/cn'
import { ORG_NAME } from '../../config/brand'

/**
 * The XAI Robotics badge, copied from the website's `public/logo.png` so both
 * apps show the same file (512 × 512, round, transparent corners). The badge is
 * dark with a silver rim, so it reads on the navy sidebar and on white cards
 * alike; only the lettering beside it changes with the surface.
 */
const LOGO_URL = '/xai-logo.png'

interface LogoProps {
  /** Sizes the row — the badge fills its height, the lettering scales with it. */
  className?: string
  /** `light` has white lettering for the navy sidebar, `dark` navy for white cards. */
  tone?: 'light' | 'dark'
}

export function Logo({ className, tone = 'light' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img src={LOGO_URL} alt="" width={64} height={64} className="h-full w-auto shrink-0" />
      <span
        className={cn(
          'flex flex-col leading-none tracking-[0.18em]',
          tone === 'light' ? 'text-white' : 'text-slate-900',
        )}
      >
        <span className="text-base font-semibold">XAI</span>
        <span className="mt-1 text-[0.6rem] font-medium opacity-70">ROBOTICS</span>
        <span className="sr-only">{ORG_NAME}</span>
      </span>
    </span>
  )
}

/** Square app mark — the collapsed sidebar rail and the favicon. */
export function LogoMark({ className }: { className?: string }) {
  return <img src={LOGO_URL} alt={ORG_NAME} width={64} height={64} className={cn('shrink-0', className)} />
}
