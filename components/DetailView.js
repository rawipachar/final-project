'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FONT, RED, LIGHT_BLUE, GRAY, PRIORITY_COLORS } from '@/lib/constants'
import Badge        from '@/components/Badge'
import EmojiIcon    from '@/components/EmojiIcon'
import ProgressRing from '@/components/ProgressRing'
import SubtaskRow   from '@/components/SubtaskRow'
import { Chevron }  from '@/components/Icons'

// ─── helpers ────────────────────────────────────────────────────
function calcProgress(subtasks) {
  if (!subtasks || subtasks.length === 0) return { percent: 0, remaining: 0, total: 0 }
  const total        = subtasks.reduce((s, t) => s + t.duration, 0)
  const completedHrs = subtasks.reduce((s, t) => s + (t.duration * (t.progress ?? (t.completed ? 100 : 0)) / 100), 0)
  const percent      = total > 0 ? Math.round((completedHrs / total) * 100) : 0
  const remaining    = Math.round(total - completedHrs)
  return { percent, remaining, total }
}

function fmtHrs(h) {
  if (!h && h !== 0) return '—'
  return h === 1 ? '1 hr' : `${h} hrs`
}

function buildFallbackSubtasks(taskDuration) {
  const totalH = Math.max(1, Math.round((taskDuration || 60) / 60))
  return [
    { id: 1, title: 'Planning',  description: 'Define scope and requirements', duration: Math.max(1, Math.round(totalH * 0.15)), completed: false },
    { id: 2, title: 'Execution', description: 'Core implementation work',      duration: Math.max(1, Math.round(totalH * 0.50)), completed: false },
    { id: 3, title: 'Review',    description: 'Quality check and refinements', duration: Math.max(1, Math.round(totalH * 0.25)), completed: false },
    { id: 4, title: 'Delivery',  description: 'Final delivery and handoff',    duration: Math.max(1, Math.round(totalH * 0.10)), completed: false },
  ]
}

function PencilIcon({ color = '#AAAAAA' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function DetailView({ task, onClose, onEdit }) {
  const [subtasks, setSubtasks] = useState(null)
  const [allDone,  setAllDone]  = useState(false)

  const priorityColor = PRIORITY_COLORS[task.priority] || RED

  const withProgress = (arr) => arr.map(s => ({ ...s, progress: s.progress ?? (s.completed ? 100 : 0) }))

  useEffect(() => {
    if (task.subtasks && task.subtasks.length > 0) {
      setSubtasks(withProgress(task.subtasks))
      return
    }

    let cancelled = false
    fetch('/api/tasks')
      .then(r => {
        if (!r.ok) throw new Error('Network response was not ok')
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        const match = data.tasks?.find(t => t.id === task.id)
        setSubtasks(withProgress(match?.subtasks ?? buildFallbackSubtasks(task.duration)))
      })
      .catch(() => {
        if (!cancelled) setSubtasks(withProgress(buildFallbackSubtasks(task.duration)))
      })
    return () => { cancelled = true }
  }, [task.id, task.duration, task.subtasks]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (subtaskId, completed) => {
    setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, completed, progress: completed ? 100 : 0 } : s))
    setAllDone(false)
  }

  const handleProgressChange = (subtaskId, newProgress) => {
    setSubtasks(prev => prev.map(s =>
      s.id === subtaskId
        ? { ...s, progress: newProgress, completed: newProgress === 100 }
        : s
    ))
  }

  const handleDone = () => {
    setSubtasks(prev => prev.map(s => ({ ...s, completed: true, progress: 100 })))
    setAllDone(true)
  }

  const { percent, remaining, total } = subtasks
    ? calcProgress(subtasks)
    : { percent: 0, remaining: 0, total: 0 }

  const isComplete = percent === 100

  return createPortal(
    // Outer overlay — fills the screen, centres the constrained panel
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 300,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      backgroundColor: '#F5F5F3',
    }}>
      {/* Inner container — max 430 px, all content lives here */}
      <div style={{
        width: '100%',
        maxWidth: 430,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        backgroundColor: '#F5F5F3',
        position: 'relative',
        fontFamily: FONT,
        animation: 'dvSlideIn 0.32s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <style>{`
          @keyframes dvSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes dvPulse {
            0%,100% { transform: scale(1); }
            50%     { transform: scale(1.04); }
          }
        `}</style>

        {/* Scrollable body */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 120,
          boxSizing: 'border-box',
          width: '100%',
        }}>

          {/* Task Header Card */}
          <div style={{
            backgroundColor: LIGHT_BLUE,
            borderRadius: '0 0 28px 28px',
            padding: '52px 20px 22px',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}>
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
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: '#C8D8E8', flexShrink: 0,
              }} />
              <EmojiIcon emoji={task.emoji} size={62} bg="#fff" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Badge priority={task.priority} />
                <h1 style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#1a1a1a',
                  margin: '4px 0 0',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
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

          {/* Description */}
          <div style={{ padding: '22px 24px 0', boxSizing: 'border-box' }}>
            <p style={{ fontSize: 15, color: '#444', lineHeight: 1.72, margin: 0 }}>
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Progress Stats + Subtask list */}
          {subtasks && (
            <div style={{ padding: '28px 24px 0', boxSizing: 'border-box' }}>

              {/* Stats row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 22,
                width: '100%',
                boxSizing: 'border-box',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                {/* Ring + percent */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ProgressRing percent={percent} color={priorityColor} />
                  <span style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: priorityColor,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    transition: 'all 0.4s',
                    animation: isComplete ? 'dvPulse 0.6s ease' : 'none',
                  }}>
                    {percent}%
                  </span>
                </div>

                {/* Hours left */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: priorityColor,
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'all 0.4s',
                  }}>
                    {fmtHrs(remaining)}
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: priorityColor }}> Left</span>
                </div>
              </div>

              {/* Separator */}
              <div style={{ height: 1, backgroundColor: '#DDD', marginBottom: 26 }} />

              {/* Subtask rows */}
              {subtasks.map(s => (
                <SubtaskRow
                  key={s.id}
                  subtask={s}
                  onToggle={handleToggle}
                  onProgressChange={handleProgressChange}
                />
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {!subtasks && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  height: 72, borderRadius: 16, backgroundColor: '#E8E8E8',
                  marginBottom: 14, opacity: 1 - i * 0.15,
                }}/>
              ))}
            </div>
          )}
        </div>

        {/* Done button — absolute inside the relative inner container */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: '18px 40px 38px',
          background: 'linear-gradient(to top, #F5F5F3 65%, transparent)',
          display: 'flex',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: '100%',
        }}>
          <button
            onClick={handleDone}
            disabled={isComplete}
            style={{
              backgroundColor: isComplete ? '#3A9E3A' : priorityColor,
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
                : `0 8px 28px ${priorityColor}52`,
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
    </div>,
    document.body
  )
}
