/**
 * Icon system.
 *
 * DV360 uses Google's Material Icons. We render them via the Material Icons /
 * Material Symbols web fonts (loaded in index.html) using ligature names, which
 * gives pixel-identical glyphs to the reference without bundling SVGs.
 */
import React from 'react'

type IconProps = {
  name: string
  className?: string
  size?: number
  filled?: boolean
  style?: React.CSSProperties
  title?: string
}

/** Outlined Material Symbol (the style DV360 uses across the app). */
export function Icon({ name, className = '', size = 20, filled = false, style, title }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      {name}
    </span>
  )
}

/**
 * The Display & Video 360 product mark — a green "play" triangle built from
 * three rounded segments with a darker dot at the lower-left vertex. Colours
 * and proportions were sampled directly from the reference recording.
 */
export function DV360Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-label="Display & Video 360" fill="none">
      {/* top edge (top-left → right point) */}
      <path d="M12.5 9 L30.5 19.6" stroke="#34A853" strokeWidth="6.4" strokeLinecap="round" />
      {/* bottom edge (bottom-left → right point) */}
      <path d="M12.5 31 L30.5 20.4" stroke="#5BB974" strokeWidth="6.4" strokeLinecap="round" />
      {/* left edge */}
      <path d="M12.5 9 L12.5 31" stroke="#34A853" strokeWidth="6.4" strokeLinecap="round" />
      {/* lower-left vertex dot */}
      <circle cx="12.5" cy="31" r="3.7" fill="#188038" />
    </svg>
  )
}
