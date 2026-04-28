'use client'

import { PRIORITY_BADGE } from '@/lib/constants'

/**
 * Badge
 * Renders a coloured pill showing the priority level.
 * Props: priority ('highest'|'high'|'medium'|'low')
 */
export default function Badge({ priority }) {
  const b = PRIORITY_BADGE[priority] || PRIORITY_BADGE.medium

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: b.bg,
        borderRadius: 999,
        padding: '2px 10px',
        marginBottom: 3,
        fontSize: 11,
        fontWeight: 700,
        color: b.text,
        letterSpacing: '0.03em',
      }}
    >
      {b.label}
    </span>
  )
}
