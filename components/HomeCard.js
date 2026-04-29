'use client'

import { useState, useRef, useEffect } from 'react'
import { FONT, GRAY, PRIORITY_BADGE, PRIORITY_COLORS } from '@/lib/constants'
import EmojiIcon from '@/components/EmojiIcon'
import { ClockIcon, Chevron } from '@/components/Icons'
import { formatDeadlineFull, formatTime } from '@/lib/utils'

/**
 * HomeCard
 * Task card shown on the Home page.
 *
 * Props:
 *   task       – { id, title, priority, duration, emoji, deadline, description }
 *   variant    – 'urgent' | 'upcoming'
 *   isExpanded – boolean, controlled by parent
 *   onToggle   – called when card body is tapped (expand/collapse)
 *   onEdit     – (task) => void — opens TaskPanel; pencil only shown when provided
 */
export default function HomeCard({ task, variant, isExpanded, onToggle, onEdit }) {
  const [checked, setChecked] = useState(false)
  const detailRef = useRef(null)
  const [height, setHeight]   = useState(0)

  const urgent      = variant === 'urgent'
  const badge       = PRIORITY_BADGE[task.priority]  || PRIORITY_BADGE.medium
  const accentColor = PRIORITY_COLORS[task.priority] || '#CF0A00'
  const textColor   = urgent ? '#fff' : '#1a1a1a'
  const subColor    = urgent ? 'rgba(255,255,255,0.7)' : '#888'

  // Measured-height accordion animation
  useEffect(() => {
    if (!detailRef.current) return
    if (isExpanded) {
      setHeight(detailRef.current.scrollHeight)
    } else {
      setHeight(detailRef.current.scrollHeight)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0))
      })
    }
  }, [isExpanded])

  return (
    <div
      onClick={() => onToggle?.()}
      style={{
        background: urgent
          ? 'linear-gradient(135deg, #CF0A00 0%, #a80800 100%)'
          : GRAY,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: urgent
          ? '0 8px 32px rgba(207,10,0,0.25)'
          : isExpanded
            ? '0 6px 24px rgba(0,0,0,0.09)'
            : 'none',
        transition: 'box-shadow 0.25s',
        fontFamily: FONT,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Main row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px' }}>

        {/* Checkbox — click is separate from card toggle */}
        <div
          onClick={(e) => { e.stopPropagation(); setChecked(!checked) }}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            flexShrink: 0,
            border: `2px solid ${urgent
              ? (checked ? '#fff' : 'rgba(255,255,255,0.5)')
              : (checked ? accentColor : '#ccc')}`,
            backgroundColor: checked
              ? (urgent ? '#fff' : accentColor)
              : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          {checked && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 5L4.5 8.5L11 1"
                stroke={urgent ? accentColor : '#fff'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Emoji icon */}
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
              backgroundColor: urgent ? 'rgba(255,255,255,0.2)' : badge.bg,
              padding: '2px 8px',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: urgent ? '#fff' : badge.text, textTransform: 'capitalize' }}>
              {badge.label}
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

        {/* Chevron rotates when expanded */}
        <div
          style={{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
            flexShrink: 0,
          }}
        >
          <Chevron dir="right" color={urgent ? '#fff' : '#1a1a1a'} opacity={urgent ? 0.6 : 0.3} />
        </div>
      </div>

      {/* ── Expandable detail panel ── */}
      <div
        style={{
          height: isExpanded ? (height || 'auto') : 0,
          overflow: 'hidden',
          transition: 'height 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div ref={detailRef}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: urgent ? 'rgba(0,0,0,0.12)' : '#fff',
              margin: '0 12px 12px',
              borderRadius: 16,
              padding: '14px 16px',
              boxSizing: 'border-box',
            }}
          >
            {/* Deadline + edit button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: task.description ? 8 : 0,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: urgent ? '#fff' : '#CF0A00', lineHeight: 1.4 }}>
                Due {formatDeadlineFull(task.deadline)} at {formatTime(task.deadline)}
              </span>

              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                  title="Edit task"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z"
                      stroke={urgent ? 'rgba(255,255,255,0.7)' : '#aaa'}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p style={{
                fontSize: 14,
                color: urgent ? 'rgba(255,255,255,0.85)' : '#555',
                lineHeight: 1.65,
                margin: 0,
              }}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
