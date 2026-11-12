import { Logo } from '../../components/common/Logo'
import { cn } from '../../lib/cn'

interface BrandLogoProps {
  className?: string
  /** Height class, e.g. `h-7`. Width follows the aspect ratio. */
  height?: string
}

/** The logo on the white sign-in card, which needs the navy-lettered artwork. */
export function BrandLogo({ className, height = 'h-6' }: BrandLogoProps) {
  return <Logo tone="dark" className={cn(height, className)} />
}
