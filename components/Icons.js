'use client'

// ─────────────────────────────────────────────
// ClockIcon
// Props: color (string), size (number)
// ─────────────────────────────────────────────
export function ClockIcon({ color = '#888', size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5" />
      <path d="M8 4.5V8L10.5 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// Chevron
// Props: dir ('right'|'left'|'down'|'up'), color, size, opacity
// ─────────────────────────────────────────────
export function Chevron({ dir = 'right', color = '#1a1a1a', size = 8, opacity = 0.3 }) {
  const paths = {
    right: 'M1 1L7 7L1 13',
    left:  'M7 1L1 7L7 13',
    down:  'M1 1L7 7L13 1',
    up:    'M1 7L7 1L13 7',
  }
  const isHorizontal = dir === 'right' || dir === 'left'
  const w  = isHorizontal ? size : 14
  const h  = isHorizontal ? 14   : 8
  const vb = isHorizontal ? '0 0 8 14' : '0 0 14 8'

  return (
    <svg width={w} height={h} viewBox={vb} fill="none" style={{ flexShrink: 0, opacity }}>
      <path d={paths[dir]} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
