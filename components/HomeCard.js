'use client'

import { useState } from 'react'
import { RED, GRAY, HOME_PRIORITY_STYLES } from '@/lib/constants'
import EmojiIcon from '@/components/EmojiIcon'
import { ClockIcon, Chevron } from '@/components/Icons'

/**
 * HomeCard
 * Task card shown on Page 1 (Home).
 * Supports two visual variants: 'urgent' (red gradient) and 'upcoming' (gray).
 *
 * Props:
 *   task    – { title, priority, duration, emoji }
 *   variant – 'urgent' | 'upcoming'
 */
export default function HomeCard({ task, variant }) {
  const [checked, setChecked] = useState(false)

  const urgent = variant === 'urgent'
  const p      = HOME_PRIORITY_STYLES[task.priority] || HOME_PRIORITY_STYLES.medium
  const textColor = urgent ? '#fff' : '#1a1a1a'
  const subColor  = urgent ? 'rgba(255,255,255,0.7)' : '#888'

  return (
    <div
      onClick={() => setChecked(!checked)}
      style={{
        background: urgent
          ? 'linear-gradient(135deg, #CF0A00 0%, #a80800 100%)'
          : GRAY,
        borderRadius: 20,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: urgent ? '0 8px 32px rgba(207,10,0,0.25)' : 'none',
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          flexShrink: 0,
          border: `2px solid ${urgent
            ? (checked ? '#fff' : 'rgba(255,255,255,0.5)')
            : (checked ? RED : '#ccc')}`,
          backgroundColor: checked
            ? (urgent ? '#fff' : RED)
            : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke={urgent ? RED : '#fff'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Icon */}
      <EmojiIcon
        emoji={task.emoji}
        size={44}
        bg={urgent ? 'rgba(255,255,255,0.15)' : '#fff'}
      />

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Priority badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            marginBottom: 3,
            backgroundColor: urgent ? 'rgba(255,255,255,0.2)' : p.bg,
            padding: '2px 8px',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: urgent ? '#fff' : p.color,
              textTransform: 'capitalize',
            }}
          >
            {p.label}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: textColor,
            textDecoration: checked ? 'line-through' : 'none',
            opacity: checked ? 0.6 : 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.title}
        </div>

        {/* Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <ClockIcon color={urgent ? '#fff' : '#888'} />
          <span style={{ fontSize: 12, color: subColor }}>{task.duration}</span>
        </div>
      </div>

      <Chevron
        dir="right"
        color={urgent ? '#fff' : '#1a1a1a'}
        opacity={urgent ? 0.6 : 0.3}
      />
    </div>
  )
}
