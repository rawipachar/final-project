'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import { FONT, RED, LIGHT_BLUE, GRAY } from '@/lib/constants'

// ─── task store (module-level, persists across nav) ───────────────────────
let taskStore = [
  {
    id: 1,
    title: 'Final Prototype',
    deadline: (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 120); return d.toISOString() })(),
    priority: 'high', duration: 90, description: '', emoji: '🧶', subtasks: [],
  },
  {
    id: 2,
    title: 'Draft 2',
    deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString() })(),
    priority: 'medium', duration: 80, description: '', emoji: '🧶', subtasks: [],
  },
  {
    id: 3,
    title: 'Draft 6',
    deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString() })(),
    priority: 'low', duration: 20, description: '', emoji: '✏️', subtasks: [],
  },
]
let nextId = 10
let nextSubId = 1

// ─── helpers ──────────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtHrs(h) {
  if (!h && h !== 0) return '—'
  return h === 1 ? '1 hr' : `${h} hrs`
}

const PRIORITY_COLOR = { high: RED, medium: '#E8781A', low: '#D4A017' }

// ─── design tokens ────────────────────────────────────────────────────────
const inp = {
  backgroundColor: '#fff',
  border: 'none',
  outline: 'none',
  fontSize: 15,
  color: '#1a1a1a',
  fontFamily: FONT,
  width: '100%',
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: '#5A7A9A',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      margin: '0 0 8px',
    }}>
      {children}
    </p>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 16,
      padding: '14px 16px', ...style,
    }}>
      {children}
    </div>
  )
}

// ─── SubtaskEditor ────────────────────────────────────────────────────────
// Mirrors the SubtaskRow visual from DetailView but is editable
function SubtaskEditorRow({ subtask, onChange, onRemove, index }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 16,
      padding: '14px 16px', marginBottom: 10,
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Circle — matches DetailView style */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          backgroundColor: '#E0E0E0', flexShrink: 0, marginTop: 2,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + duration row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {/* Subtask name input */}
            <input
              type="text"
              placeholder="Subtask name"
              value={subtask.title}
              onChange={e => onChange(subtask.id, 'title', e.target.value)}
              style={{
                ...inp, flex: 1,
                fontSize: 14, fontWeight: 700, color: RED,
                borderBottom: '1px solid #F0F0F0', paddingBottom: 2,
              }}
            />
            {/* Duration hours */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              backgroundColor: GRAY, borderRadius: 8, padding: '4px 10px', flexShrink: 0,
            }}>
              <input
                type="number"
                min="0"
                max="99"
                value={subtask.hours}
                onChange={e => onChange(subtask.id, 'hours', e.target.value)}
                style={{
                  ...inp, width: 28, textAlign: 'center',
                  fontSize: 14, fontWeight: 700, color: RED,
                  backgroundColor: 'transparent',
                  MozAppearance: 'textfield',
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.05em' }}>
                HRS
              </span>
            </div>
          </div>

          {/* Description input */}
          <input
            type="text"
            placeholder="Brief description…"
            value={subtask.description}
            onChange={e => onChange(subtask.id, 'description', e.target.value)}
            style={{
              ...inp, fontSize: 13, color: '#555',
              borderBottom: '1px solid #F0F0F0', paddingBottom: 2, marginBottom: 10,
            }}
          />

          {/* Progress track preview — matches DetailView exactly */}
          <div style={{ position: 'relative', height: 6, backgroundColor: '#DDD', borderRadius: 999, overflow: 'visible' }}>
            <div style={{
              position: 'absolute', top: '50%',
              left: 'calc(28% - 8px)',
              transform: 'translateY(-50%)',
              width: 16, height: 16, borderRadius: '50%',
              backgroundColor: RED,
              boxShadow: '0 1px 8px rgba(207,10,0,0.4)',
            }} />
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(subtask.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#CCC', fontSize: 18, lineHeight: 1,
            padding: '2px 4px', flexShrink: 0, marginTop: -2,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = RED}
          onMouseLeave={e => e.currentTarget.style.color = '#CCC'}
          title="Remove subtask"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ─── AddTaskPage ──────────────────────────────────────────────────────────
export default function AddTaskPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState(taskStore)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [submitted, setSubmitted] = useState(false)
  const [shake, setShake] = useState(false)

  const [form, setForm] = useState({
    title: '',
    deadline: todayStr(),
    deadlineTime: '09:00',
    priority: 'high',
    hours: '0',
    minutes: '00',
    description: '',
    emoji: '🧶',
  })

  const [subtasks, setSubtasks] = useState([])

  // ── form helpers ──
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr)
    setForm(f => ({ ...f, deadline: dateStr }))
  }

  // ── subtask CRUD ──
  const addSubtask = () => {
    setSubtasks(prev => [...prev, {
      id: nextSubId++,
      title: '',
      description: '',
      hours: 1,
      completed: false,
    }])
  }

  const updateSubtask = (id, field, value) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const removeSubtask = (id) => {
    setSubtasks(prev => prev.filter(s => s.id !== id))
  }

  // ── total computed hours ──
  const subtaskTotalHrs = subtasks.reduce((sum, s) => sum + (parseInt(s.hours) || 0), 0)
  const formHrs = parseInt(form.hours || 0)
  const formMins = parseInt(form.minutes || 0)
  // If subtasks exist, total = subtask sum. Otherwise form time.
  const totalDuration = subtasks.length > 0
    ? subtaskTotalHrs * 60
    : formHrs * 60 + formMins

  // ── submit ──
  const handleSubmit = () => {
    if (!form.title.trim()) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    const deadlineISO = `${form.deadline}T${form.deadlineTime}:00`

    const normalizedSubtasks = subtasks.map((s, i) => ({
      id: i + 1,
      title: s.title || `Step ${i + 1}`,
      description: s.description || '',
      duration: parseInt(s.hours) || 1,
      completed: false,
    }))

    const newTask = {
      id: nextId++,
      title: form.title.trim(),
      deadline: deadlineISO,
      priority: form.priority,
      duration: totalDuration,
      description: form.description,
      emoji: form.emoji,
      subtasks: normalizedSubtasks,
    }

    taskStore = [newTask, ...taskStore]
    setTasks([...taskStore])
    setSubmitted(true)

    setTimeout(() => {
      setForm({
        title: '', deadline: selectedDate, deadlineTime: '09:00',
        priority: 'high', hours: '0', minutes: '00', description: '', emoji: '🧶',
      })
      setSubtasks([])
      setSubmitted(false)
    }, 1600)
  }

  const priorityColor = PRIORITY_COLOR[form.priority] || RED

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff',
      fontFamily: FONT,
      maxWidth: 430,
      margin: '0 auto',
    }}>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes subtaskIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '52px 24px 16px',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: RED, fontWeight: 600, fontSize: 15, fontFamily: FONT, padding: 0,
          }}
        >
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
            <path d="M8 1L1 8L8 15" stroke={RED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>New Task</h1>
        <div style={{ width: 60 }} />
      </div>

      {/* ── Calendar ─────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 8px' }}>
        <Calendar tasks={tasks} selectedDate={selectedDate} onDateSelect={handleDateSelect} />
      </div>

      {/* ── Form card ────────────────────────────────────────── */}
      <div style={{
        backgroundColor: LIGHT_BLUE,
        borderRadius: '28px 28px 0 0',
        padding: '28px 20px 48px',
        marginTop: 8,
      }}>

        {/* Task name */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Task Name</SectionLabel>
          <Card style={{
            animation: shake ? 'shake 0.4s ease' : 'none',
            outline: shake ? `2px solid ${RED}` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Emoji picker */}
              <button
                onClick={() => {
                  const emojis = ['🧶', '📝', '✏️', '🎨', '📐', '🔧', '📊', '🗂️', '💡', '🚀']
                  const idx = emojis.indexOf(form.emoji)
                  setForm(f => ({ ...f, emoji: emojis[(idx + 1) % emojis.length] }))
                }}
                style={{
                  fontSize: 26, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, flexShrink: 0,
                  borderRadius: 10, lineHeight: 1,
                }}
                title="Tap to change icon"
              >
                {form.emoji}
              </button>
              <input
                type="text"
                placeholder="What's on your deadline"
                value={form.title}
                onChange={set('title')}
                style={{ ...inp, flex: 1, padding: 0, fontSize: 16, fontWeight: 600 }}
                autoFocus
              />
            </div>
          </Card>
        </div>

        {/* Deadline + Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          <div>
            <SectionLabel>Deadline</SectionLabel>
            <Card>
              <input
                type="date"
                value={form.deadline}
                min={todayStr()}
                onChange={(e) => { set('deadline')(e); setSelectedDate(e.target.value) }}
                style={{ ...inp, fontSize: 13 }}
              />
            </Card>
          </div>
          <div>
            <SectionLabel>Priority</SectionLabel>
            <Card>
              <select
                value={form.priority}
                onChange={set('priority')}
                style={{
                  ...inp, appearance: 'none', WebkitAppearance: 'none',
                  cursor: 'pointer', fontWeight: 700, color: priorityColor,
                }}
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </Card>
          </div>
        </div>

        {/* Estimated work time — hidden if subtasks cover it */}
        {subtasks.length === 0 && (
          <div style={{ marginBottom: 18 }}>
            <SectionLabel>Estimated Work Time</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['hours', 'HRS', 0, 99], ['minutes', 'MINS', 0, 59]].map(([field, unit, min, max]) => (
                <Card key={field}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="number" min={min} max={max}
                      value={form[field]}
                      onChange={set(field)}
                      style={{ ...inp, width: 40, fontSize: 20, fontWeight: 700, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa', letterSpacing: '0.07em' }}>
                      {unit}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Description + Subtask section ────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>Description & Subtasks</SectionLabel>

          {/* Description textarea */}
          <Card style={{ marginBottom: 10 }}>
            <textarea
              placeholder="Describe what needs to be done…"
              value={form.description}
              onChange={set('description')}
              rows={3}
              style={{ ...inp, resize: 'none', lineHeight: 1.6 }}
            />
          </Card>

          {/* Subtask list — mirrors DetailView visual exactly */}
          {subtasks.length > 0 && (
            <div style={{ animation: 'subtaskIn 0.2s ease' }}>
              {subtasks.map((s, i) => (
                <SubtaskEditorRow
                  key={s.id}
                  subtask={s}
                  index={i}
                  onChange={updateSubtask}
                  onRemove={removeSubtask}
                />
              ))}
            </div>
          )}

          {/* ── Add Subtask button ── */}
          <button
            onClick={addSubtask}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '12px 0',
              borderRadius: 14,
              border: `2px dashed rgba(207,10,0,0.25)`,
              backgroundColor: 'rgba(207,10,0,0.04)',
              cursor: 'pointer',
              color: RED,
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(207,10,0,0.08)'
              e.currentTarget.style.borderColor = 'rgba(207,10,0,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(207,10,0,0.04)'
              e.currentTarget.style.borderColor = 'rgba(207,10,0,0.25)'
            }}
          >
            {/* Plus-in-circle icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke={RED} strokeWidth="1.5"/>
              <path d="M10 6V14M6 10H14" stroke={RED} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add subtask
          </button>

          {/* Summary chip — shows when subtasks exist */}
          {subtasks.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
              padding: '10px 14px',
              backgroundColor: 'rgba(207,10,0,0.06)',
              borderRadius: 12,
            }}>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
                {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 700, color: RED,
              }}>
                {fmtHrs(subtaskTotalHrs)} total
              </span>
            </div>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: 18,
            backgroundColor: submitted ? '#3A9E3A' : RED,
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontSize: 17,
            fontWeight: 700,
            fontFamily: FONT,
            cursor: 'pointer',
            letterSpacing: '0.01em',
            boxShadow: submitted
              ? '0 8px 24px rgba(58,158,58,0.3)'
              : '0 8px 24px rgba(207,10,0,0.28)',
            transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {submitted ? '✓ Task added!' : "Let's get to work"}
        </button>
      </div>
    </div>
  )
}
