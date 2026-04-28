'use client'

import { RED } from '@/lib/constants'

/**
 * Checkbox
 * Round toggle with animated check mark.
 * Props: checked (bool), onChange (fn)
 */
export default function Checkbox({ checked, onChange }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: `2px solid ${checked ? RED : '#C8C8C8'}`,
        backgroundColor: checked ? RED : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path
            d="M1 5L4.5 8.5L11 1"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}
