'use client'

import { useState, useEffect, useRef } from 'react'
import { RED } from '@/lib/constants'

export default function SubtaskRow({ subtask, onToggle, onProgressChange }) {
  const [progress, setProgress] = useState(subtask.progress ?? (subtask.completed ? 100 : 0))
  const trackRef   = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    setProgress(subtask.progress ?? (subtask.completed ? 100 : 0))
  }, [subtask.progress, subtask.completed])

  const getProgressFromEvent = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect()
    const clamped = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1))
    return Math.round(clamped * 100)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    isDragging.current = true
    const p = getProgressFromEvent(e.clientX)
    setProgress(p)
    onProgressChange(subtask.id, p)
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const p = getProgressFromEvent(e.clientX)
    setProgress(p)
    onProgressChange(subtask.id, p)
  }

  const handleMouseUp = () => { isDragging.current = false }

  const handleTouchStart = (e) => {
    isDragging.current = true
    const p = getProgressFromEvent(e.touches[0].clientX)
    setProgress(p)
    onProgressChange(subtask.id, p)
  }

  const handleTouchMove = (e) => {
    if (!isDragging.current) return
    e.preventDefault()
    const p = getProgressFromEvent(e.touches[0].clientX)
    setProgress(p)
    onProgressChange(subtask.id, p)
  }

  const handleTouchEnd = () => { isDragging.current = false }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup',   handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup',   handleMouseUp)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checked  = progress === 100
  const fmtHrs   = (h) => h === 1 ? '1 hr' : `${h} hrs`

  return (
    <div style={{ marginBottom: 26, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

        {/* Circle checkbox — tap to toggle 0 ↔ 100 */}
        <div
          onClick={() => {
            const next = checked ? 0 : 100
            setProgress(next)
            onProgressChange(subtask.id, next)
          }}
          style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            cursor: 'pointer',
            backgroundColor: checked ? RED : '#E0E0E0',
            boxShadow: checked ? '0 2px 10px rgba(207,10,0,0.35)' : 'none',
            transition: 'background-color 0.25s, box-shadow 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          {checked && (
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
              <path d="M1.5 5.5L5 9L11.5 1.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + duration */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
            <span style={{
              fontSize: 15, fontWeight: 700, color: RED,
              textDecoration: checked ? 'line-through' : 'none',
              opacity: checked ? 0.55 : 1, transition: 'opacity 0.2s',
            }}>
              {subtask.title}
            </span>
            <span style={{
              fontSize: 14, fontWeight: 600, color: RED,
              flexShrink: 0, marginLeft: 8,
              opacity: checked ? 0.5 : 1, transition: 'opacity 0.2s',
            }}>
              {fmtHrs(subtask.duration)}
            </span>
          </div>

          {/* Description */}
          <p style={{
            fontSize: 13, color: '#555', margin: '0 0 11px', lineHeight: 1.5,
            opacity: checked ? 0.45 : 1, transition: 'opacity 0.25s',
          }}>
            {subtask.description}
          </p>

          {/* Progress label */}
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: RED, opacity: 0.7 }}>
              {progress}%
            </span>
          </div>

          {/* Draggable progress track */}
          <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'relative', height: 6,
              backgroundColor: '#DDD', borderRadius: 999,
              overflow: 'visible', cursor: 'pointer',
              userSelect: 'none', touchAction: 'none',
            }}
          >
            {/* Filled portion */}
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${progress}%`,
              backgroundColor: RED, borderRadius: 999,
              pointerEvents: 'none',
            }} />

            {/* Draggable dot */}
            <div style={{
              position: 'absolute', top: '50%',
              left: `calc(${progress}% - 10px)`,
              transform: 'translateY(-50%)',
              width: 20, height: 20, borderRadius: '50%',
              backgroundColor: RED,
              boxShadow: '0 1px 8px rgba(207,10,0,0.5)',
              cursor: 'grab',
              pointerEvents: 'none',
              transition: isDragging.current ? 'none' : 'left 0.1s ease',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
