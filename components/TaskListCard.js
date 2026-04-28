'use client'

import { useState, useEffect, useRef } from 'react'
import { LIGHT_BLUE, RED } from '@/lib/constants'
import { formatDuration, formatDeadlineFull } from '@/lib/utils'
import Badge    from '@/components/Badge'
import Checkbox from '@/components/Checkbox'
import EmojiIcon from '@/components/EmojiIcon'
import { ClockIcon, Chevron } from '@/components/Icons'

/**
 * TaskListCard
 * Accordion-style task card used on Page 2 (Task List).
 *
 * Props:
 *   task       – task object
 *   isExpanded – boolean, controlled by parent
 *   onToggle   – called when the card is tapped
 *   onEdit     – called when the pencil icon is tapped; receives the task object
 */
export default function TaskListCard({ task, isExpanded, onToggle, onEdit }) {
  const detailRef = useRef(null)
  const [height, setHeight] = useState(0)
  const [checked, setChecked] = useState(false)

  // Smoothly animate the detail panel height
  useEffect(() => {
    if (!detailRef.current) return
    if (isExpanded) {
      setHeight(detailRef.current.scrollHeight)
    } else {
      // Set explicit height first so the transition has a starting value
      setHeight(detailRef.current.scrollHeight)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0))
      })
    }
  }, [isExpanded])

  return (
    <div
      onClick={onToggle}
      style={{
        backgroundColor: LIGHT_BLUE,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.25s',
        boxShadow: isExpanded
          ? '0 6px 24px rgba(0,0,0,0.09)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        userSelect: 'none',
      }}
    >
      {/* ── Main row ──────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        <Checkbox checked={checked} onChange={setChecked} />

        <EmojiIcon emoji={task.emoji} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Badge priority={task.priority} />

          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: '#1a1a1a',
              textDecoration: checked ? 'line-through' : 'none',
              opacity: checked ? 0.45 : 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'opacity 0.2s',
            }}
          >
            {task.title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <ClockIcon color={checked ? '#bbb' : '#888'} />
            <span style={{ fontSize: 13, color: checked ? '#bbb' : '#888' }}>
              {formatDuration(task.duration)}
            </span>
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
          <Chevron dir="right" opacity={0.25} />
        </div>
      </div>

      {/* ── Expandable detail panel ───────────── */}
      <div
        style={{
          height: isExpanded ? height || 'auto' : 0,
          overflow: 'hidden',
          transition: 'height 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div ref={detailRef}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              margin: '0 12px 12px',
              borderRadius: 16,
              padding: '14px 16px',
            }}
          >
            {/* Deadline + edit button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: RED, lineHeight: 1.4 }}>
                Deadline is due on {formatDeadlineFull(task.deadline)}
              </span>

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
                {/* Pencil icon */}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z"
                    stroke="#aaa"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Description text */}
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: 0 }}>
              {task.description || 'No description added yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
