'use client'

import { useState, useEffect, useRef } from 'react'
import { RED, FONT } from '@/lib/constants'

export default function SubtaskRow({ subtask, onToggle, onProgressChange, onEdit }) {
  const [progress,     setProgress]     = useState(subtask.progress ?? (subtask.completed ? 100 : 0))
  const [editing,      setEditing]      = useState(false)
  const [editTitle,    setEditTitle]    = useState(subtask.title)
  const [editDesc,     setEditDesc]     = useState(subtask.description || '')
  const [editDuration, setEditDuration] = useState(subtask.duration || 15)

  const trackRef   = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    setProgress(subtask.progress ?? (subtask.completed ? 100 : 0))
    setEditTitle(subtask.title)
    setEditDesc(subtask.description || '')
    setEditDuration(subtask.duration || 15)
  }, [subtask.progress, subtask.completed, subtask.title, subtask.description, subtask.duration])

  // ── Drag handlers ───────────────────────────────────────────────

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

  // ── Edit handlers ───────────────────────────────────────────────

  const handleEditSave = () => {
    if (onEdit) {
      onEdit(subtask.id, {
        title:    editTitle.trim() || subtask.title,
        description: editDesc.trim(),
        duration: Math.max(5, parseInt(editDuration, 10) || 15),
      })
    }
    setEditing(false)
  }

  const handleEditCancel = () => {
    setEditTitle(subtask.title)
    setEditDesc(subtask.description || '')
    setEditDuration(subtask.duration || 15)
    setEditing(false)
  }

  const checked  = progress === 100
  const fmtMins  = (m) => m === 1 ? '1 min' : `${m} mins`

  return (
    <div style={{ marginBottom: 26, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

        {/* Circle checkbox */}
        <div
          onClick={() => {
            if (editing) return
            const next = checked ? 0 : 100
            setProgress(next)
            onProgressChange(subtask.id, next)
          }}
          style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            cursor: editing ? 'default' : 'pointer',
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
          {editing ? (
            /* ── Edit mode ── */
            <div>
              {/* Title input */}
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                autoFocus
                placeholder="Subtask title"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontSize: 15, fontWeight: 700, color: '#1a1a1a',
                  border: 'none', borderBottom: `2px solid ${RED}`,
                  background: 'transparent', outline: 'none',
                  padding: '2px 0 4px', fontFamily: FONT, marginBottom: 10,
                }}
              />

              {/* Description textarea */}
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Description"
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontSize: 13, color: '#555', lineHeight: 1.5,
                  border: '1px solid #DDD', borderRadius: 8,
                  background: '#FAFAFA', outline: 'none',
                  padding: '7px 10px', fontFamily: FONT,
                  resize: 'none', marginBottom: 10,
                }}
              />

              {/* Duration stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Duration</span>
                <button
                  onClick={() => setEditDuration(d => Math.max(5, Number(d) - 5))}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${RED}`,
                    background: 'none', color: RED, fontSize: 16, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, padding: 0,
                  }}
                >−</button>
                <span style={{ fontSize: 15, fontWeight: 700, color: RED, minWidth: 44, textAlign: 'center' }}>
                  {fmtMins(Number(editDuration))}
                </span>
                <button
                  onClick={() => setEditDuration(d => Number(d) + 5)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${RED}`,
                    background: 'none', color: RED, fontSize: 16, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, padding: 0,
                  }}
                >+</button>
              </div>

              {/* Save / Cancel */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleEditSave}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 999, border: 'none',
                    backgroundColor: RED, color: '#fff', fontSize: 14, fontWeight: 700,
                    fontFamily: FONT, cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 999,
                    border: '1.5px solid #DDD', backgroundColor: '#fff',
                    color: '#888', fontSize: 14, fontWeight: 600,
                    fontFamily: FONT, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <div>
              {/* Title + duration + edit button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <span style={{
                  fontSize: 15, fontWeight: 700, color: RED,
                  textDecoration: checked ? 'line-through' : 'none',
                  opacity: checked ? 0.55 : 1, transition: 'opacity 0.2s',
                  flex: 1, minWidth: 0, marginRight: 6,
                }}>
                  {subtask.title}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 600, color: RED,
                    opacity: checked ? 0.5 : 1, transition: 'opacity 0.2s',
                  }}>
                    {fmtMins(subtask.duration)}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    title="Edit subtask"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '2px 3px', display: 'flex', alignItems: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="#AAAAAA" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
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
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: `${progress}%`,
                  backgroundColor: RED, borderRadius: 999,
                  pointerEvents: 'none',
                }} />
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
          )}
        </div>
      </div>
    </div>
  )
}
