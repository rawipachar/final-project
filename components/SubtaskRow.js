'use client'

import { useState, useEffect } from 'react'
import { RED } from '@/lib/constants'

/**
 * SubtaskRow
 * Single subtask item: circle checkbox, title, description, progress bar with dot.
 *
 * Props:
 *   subtask  – { id, title, description, duration, completed }
 *   onToggle – (subtaskId, completed: bool) => void
 */
export default function SubtaskRow({ subtask, onToggle }) {
  const [checked, setChecked] = useState(subtask.completed)

  // Stay in sync if parent force-completes all (Done button)
  useEffect(() => {
    setChecked(subtask.completed)
  }, [subtask.completed])

  const handleToggle = () => {
    const next = !checked
    setChecked(next)
    onToggle(subtask.id, next)
  }

  const fmtHrs = (h) => (h === 1 ? '1 hr' : `${h} hrs`)

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

        {/* ── Circle checkbox ── */}
        <div
          onClick={handleToggle}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            flexShrink: 0,
            marginTop: 2,
            cursor: 'pointer',
            backgroundColor: checked ? RED : '#E0E0E0',
            boxShadow: checked ? '0 2px 10px rgba(207,10,0,0.35)' : 'none',
            transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked && (
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
              <path
                d="M1.5 5.5L5 9L11.5 1.5"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* ── Text + progress bar ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Title row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 3,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: RED,
                textDecoration: checked ? 'line-through' : 'none',
                opacity: checked ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {subtask.title}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: RED,
                flexShrink: 0,
                marginLeft: 8,
                opacity: checked ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {fmtHrs(subtask.duration)}
            </span>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 13,
              color: '#555',
              margin: '0 0 11px',
              lineHeight: 1.5,
              opacity: checked ? 0.45 : 1,
              transition: 'opacity 0.25s',
            }}
          >
            {subtask.description}
          </p>

          {/* ── Progress track ── */}
          <div
            style={{
              position: 'relative',
              height: 6,
              backgroundColor: '#DDD',
              borderRadius: 999,
              overflow: 'visible',
            }}
          >
            {/* Filled bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: checked ? '100%' : '0%',
                backgroundColor: RED,
                borderRadius: 999,
                transition: 'width 0.55s cubic-bezier(0.4,0,0.2,1)',
              }}
            />

            {/* Red dot indicator — sits at fill boundary */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: checked ? 'calc(100% - 8px)' : 'calc(28% - 8px)',
                transform: 'translateY(-50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: RED,
                boxShadow: '0 1px 8px rgba(207,10,0,0.45)',
                transition: 'left 0.55s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
