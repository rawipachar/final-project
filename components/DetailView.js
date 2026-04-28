'use client'

import { useState, useEffect } from 'react'
import { FONT, RED, LIGHT_BLUE, GRAY } from '@/lib/constants'
import Badge      from '@/components/Badge'
import EmojiIcon  from '@/components/EmojiIcon'
import ProgressRing from '@/components/ProgressRing'
import SubtaskRow from '@/components/SubtaskRow'
import { Chevron } from '@/components/Icons'

// ─── pure helpers ────────────────────────────────────────────────
function calcProgress(subtasks) {
  if (!subtasks || subtasks.length === 0) return { percent: 0, remaining: 0, total: 0 }
  const total     = subtasks.reduce((s, t) => s + t.duration, 0)
  const done      = subtasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0)
  const percent   = total > 0 ? Math.round((done / total) * 100) : 0
  return { percent, remaining: total - done, total }
}

function fmtHrs(h) {
  if (!h && h !== 0) return '—'
  return h === 1 ? '1 hr' : `${h} hrs`
}

function buildFallbackSubtasks(taskDuration) {
  // duration in the task store is minutes — convert to hours
  const totalH = Math.max(1, Math.round((taskDuration || 60) / 60))
  return [
    { id: 1, title: 'Planning',   description: 'Define scope and requirements',    duration: Math.max(1, Math.round(totalH * 0.15)), completed: false },
    { id: 2, title: 'Execution',  description: 'Core implementation work',         duration: Math.max(1, Math.round(totalH * 0.50)), completed: false },
    { id: 3, title: 'Review',     description: 'Quality check and refinements',    duration: Math.max(1, Math.round(totalH * 0.25)), completed: false },
    { id: 4, title: 'Delivery',   description: 'Final delivery and handoff',       duration: Math.max(1, Math.round(totalH * 0.10)), completed: false },
  ]
}

// ─── EditIcon (pencil) ───────────────────────────────────────────
function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z"
        stroke="#AAAAAA"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * DetailView
 * Full-screen slide-in view for a task's subtask breakdown & progress.
 * Opened when the user taps an already-expanded TaskListCard a second time.
 *
 * Props:
 *   task    – task object { id, title, priority, emoji, description, duration }
 *   onClose – () => void  — called by Back button
 *   onEdit  – (task) => void — opens TaskPanel pre-filled
 */
export default function DetailView({ task, onClose, onEdit }) {
  const [subtasks,  setSubtasks]  = useState(null)   // null = loading
  const [loadError, setLoadError] = useState(false)
  const [allDone,   setAllDone]   = useState(false)

  // ── Fetch subtasks from API ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    fetch('/api/tasks')
      .then(r => {
        if (!r.ok) throw new Error('Network response was not ok')
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        const match = data.tasks?.find(t => t.id === task.id)
        setSubtasks(match?.subtasks ?? buildFallbackSubtasks(task.duration))
      })
      .catch(() => {
        if (!cancelled) {
          setSubtasks(buildFallbackSubtasks(task.duration))
        }
      })
    return () => { cancelled = true }
  }, [task.id, task.duration])

  // ── Subtask toggle ───────────────────────────────────────────────
  const handleToggle = (subtaskId, completed) => {
    setSubtasks(prev =>
      prev.map(s => s.id === subtaskId ? { ...s, completed } : s)
    )
    setAllDone(false)
  }

  // ── Done button — mark all complete ─────────────────────────────
  const handleDone = () => {
    setSubtasks(prev => prev.map(s => ({ ...s, completed: true })))
    setAllDone(true)
  }

  // ── Derived values ───────────────────────────────────────────────
  const { percent, remaining, total } = subtasks
    ? calcProgress(subtasks)
    : { percent: 0, remaining: 0, total: 0 }

  const isComplete = percent === 100

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        backgroundColor: GRAY,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 430,
        margin: '0 auto',
        animation: 'dvSlideIn 0.32s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <style>{`
        @keyframes dvSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes dvPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
      `}</style>

      {/* ═══════════════════════════════════════════
          SCROLLABLE BODY
      ═══════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>

        {/* ── Task Header Card ───────────────────── */}
        <div
          style={{
            backgroundColor: LIGHT_BLUE,
            borderRadius: '0 0 28px 28px',
            padding: '52px 20px 22px',
            position: 'relative',
          }}
        >
          {/* Back */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 52, left: 20,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: RED, fontWeight: 600, fontSize: 15, fontFamily: FONT, padding: 0,
            }}
          >
            <Chevron dir="left" color={RED} opacity={1} />
            Back
          </button>

          {/* Edit pencil */}
          <button
            onClick={() => onEdit(task)}
            style={{
              position: 'absolute', top: 52, right: 20,
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            }}
            title="Edit task"
          >
            <PencilIcon />
          </button>

          {/* Task identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
            {/* Circle checkbox placeholder */}
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: '#C8D8E8', flexShrink: 0,
              }}
            />

            {/* Emoji */}
            <EmojiIcon emoji={task.emoji} size={62} bg="#fff" />

            {/* Title block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Badge priority={task.priority} />
              <h1 style={{
                fontSize: 22, fontWeight: 800, color: '#1a1a1a',
                margin: '4px 0 0', lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {task.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#888" strokeWidth="1.5"/>
                  <path d="M8 4.5V8L10.5 10" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, color: '#777', fontWeight: 500 }}>
                  {subtasks ? fmtHrs(total) : fmtHrs(Math.round((task.duration || 0) / 60))} work
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Description ────────────────────────── */}
        <div style={{ padding: '22px 24px 0' }}>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.72, margin: 0 }}>
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* ── Progress Stats + Subtask list ──────── */}
        {subtasks && (
          <div style={{ padding: '28px 24px 0' }}>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 22,
            }}>
              {/* Left: ring + percent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <ProgressRing percent={percent} />
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: RED,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    transition: 'all 0.4s',
                    animation: isComplete ? 'dvPulse 0.6s ease' : 'none',
                  }}
                >
                  {percent}%
                </span>
              </div>

              {/* Right: hours left */}
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: RED,
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'all 0.4s',
                  }}
                >
                  {fmtHrs(remaining)}
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, color: RED }}> Left</span>
              </div>
            </div>

            {/* Separator */}
            <div style={{ height: 1, backgroundColor: '#DDD', marginBottom: 26 }} />

            {/* Subtask rows */}
            {subtasks.map(s => (
              <SubtaskRow key={s.id} subtask={s} onToggle={handleToggle} />
            ))}

          </div>
        )}

        {/* Loading skeleton */}
        {!subtasks && !loadError && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: 72, borderRadius: 16, backgroundColor: '#E8E8E8',
                marginBottom: 14,
                opacity: 1 - i * 0.15,
              }}/>
            ))}
          </div>
        )}

        {/* Error state */}
        {loadError && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#bbb' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
            <p style={{ fontSize: 14, margin: 0 }}>Could not load subtasks.</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          FIXED DONE BUTTON
      ═══════════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: '18px 40px 38px',
          background: `linear-gradient(to top, ${GRAY} 65%, transparent)`,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={handleDone}
          disabled={isComplete}
          style={{
            backgroundColor: isComplete ? '#3A9E3A' : RED,
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '18px 88px',
            fontSize: 18,
            fontWeight: 700,
            cursor: isComplete ? 'default' : 'pointer',
            fontFamily: FONT,
            letterSpacing: '0.02em',
            boxShadow: isComplete
              ? '0 6px 20px rgba(58,158,58,0.3)'
              : '0 8px 28px rgba(207,10,0,0.32)',
            transition: 'background-color 0.4s, box-shadow 0.4s, transform 0.15s',
            animation: isComplete && allDone ? 'dvPulse 0.5s ease' : 'none',
          }}
          onMouseDown={e => { if (!isComplete) e.currentTarget.style.transform = 'scale(0.96)' }}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => { if (!isComplete) e.currentTarget.style.transform = 'scale(0.96)' }}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isComplete ? '✓ Complete!' : 'done'}
        </button>
      </div>
    </div>
  )
}
