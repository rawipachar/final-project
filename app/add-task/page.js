'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import { FONT, RED, LIGHT_BLUE, GRAY } from '@/lib/constants'
import { globalTasks, addTaskToStore, getNextId } from '@/lib/taskStore'

// ─── helpers ──────────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtHrs(h) {
  if (!h && h !== 0) return '—'
  return h === 1 ? '1 hr' : `${h} hrs`
}

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
      padding: '14px 16px', boxSizing: 'border-box', ...style,
    }}>
      {children}
    </div>
  )
}

// ─── SubtaskEditorRow ─────────────────────────────────────────────────────
function SubtaskEditorRow({ subtask, onChange, onRemove }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 16,
      padding: '14px 16px', marginBottom: 10,
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          backgroundColor: '#E0E0E0', flexShrink: 0, marginTop: 2,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
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

        <button
          onClick={() => onRemove(subtask.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#CCC', fontSize: 18, lineHeight: 1,
            padding: '2px 4px', flexShrink: 0, marginTop: -2,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = RED)}
          onMouseLeave={e => (e.currentTarget.style.color = '#CCC')}
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

  const [tasks,        setTasks]        = useState([...globalTasks])
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [submitted,    setSubmitted]    = useState(false)
  const [shake,        setShake]        = useState(false)
  const [subtasks,     setSubtasks]     = useState([])
  const nextSubIdRef = useRef(1)

  const [form, setForm] = useState({
    title:        '',
    deadline:     todayStr(),
    deadlineTime: '09:00',
    priority:     'high',
    hours:        '0',
    minutes:      '00',
    description:  '',
    emoji:        '🧶',
  })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr)
    setForm(f => ({ ...f, deadline: dateStr }))
  }

  const addSubtask = () => {
    setSubtasks(prev => [...prev, {
      id: nextSubIdRef.current++,
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

  const subtaskTotalHrs = subtasks.reduce((sum, s) => sum + (parseInt(s.hours) || 0), 0)
  const totalDuration   = subtasks.length > 0
    ? subtaskTotalHrs * 60
    : parseInt(form.hours || 0) * 60 + parseInt(form.minutes || 0)

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    const deadlineISO = `${form.deadline}T${form.deadlineTime}:00`

    const normalizedSubtasks = subtasks.map((s, i) => ({
      id:          i + 1,
      title:       s.title || `Step ${i + 1}`,
      description: s.description || '',
      duration:    parseInt(s.hours) || 1,
      completed:   false,
    }))

    const newTask = {
      id:          getNextId(),
      title:       form.title.trim(),
      deadline:    deadlineISO,
      priority:    form.priority,
      duration:    totalDuration,
      description: form.description,
      emoji:       form.emoji,
      subtasks:    normalizedSubtasks,
    }

    // Push into the shared module-level store
    addTaskToStore(newTask)
    setTasks([...globalTasks])
    setSubmitted(true)

    // Navigate back after 1.2 s so the user sees the success state
    setTimeout(() => {
      router.back()
    }, 1200)
  }

  const priorityColor = { high: RED, medium: '#CC4139', low: '#D06761' }[form.priority] || RED

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff',
      fontFamily: FONT,
      maxWidth: 430,
      margin: '0 auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
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
        input[type=date]::-webkit-calendar-picker-indicator,
        input[type=time]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '52px 24px 16px',
        boxSizing: 'border-box',
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

      {/* Calendar */}
      <div style={{ padding: '0 20px 8px', boxSizing: 'border-box' }}>
        <Calendar tasks={tasks} selectedDate={selectedDate} onDateSelect={handleDateSelect} />
      </div>

      {/* Form card */}
      <div style={{
        backgroundColor: LIGHT_BLUE,
        borderRadius: '28px 28px 0 0',
        padding: '28px 20px 48px',
        marginTop: 8,
        boxSizing: 'border-box',
      }}>

        {/* Task name */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Task Name</SectionLabel>
          <Card style={{
            animation: shake ? 'shake 0.4s ease' : 'none',
            outline: shake ? `2px solid ${RED}` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

        {/* Deadline + Due Time + Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
          <div>
            <SectionLabel>Date</SectionLabel>
            <Card>
              <input
                type="date"
                value={form.deadline}
                min={todayStr()}
                onChange={(e) => { set('deadline')(e); setSelectedDate(e.target.value) }}
                style={{ ...inp, fontSize: 12 }}
              />
            </Card>
          </div>
          <div>
            <SectionLabel>Time</SectionLabel>
            <Card>
              <input
                type="time"
                value={form.deadlineTime}
                onChange={set('deadlineTime')}
                style={{ ...inp, fontSize: 12 }}
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
                  cursor: 'pointer', fontWeight: 700, fontSize: 13, color: priorityColor,
                }}
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </Card>
          </div>
        </div>

        {/* Estimated work time */}
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

        {/* Description + Subtasks */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>Description & Subtasks</SectionLabel>

          <Card style={{ marginBottom: 10 }}>
            <textarea
              placeholder="Describe what needs to be done…"
              value={form.description}
              onChange={set('description')}
              rows={3}
              style={{ ...inp, resize: 'none', lineHeight: 1.6 }}
            />
          </Card>

          {subtasks.length > 0 && (
            <div style={{ animation: 'subtaskIn 0.2s ease' }}>
              {subtasks.map((s) => (
                <SubtaskEditorRow
                  key={s.id}
                  subtask={s}
                  onChange={updateSubtask}
                  onRemove={removeSubtask}
                />
              ))}
            </div>
          )}

          <button
            onClick={addSubtask}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px 0',
              borderRadius: 14, border: `2px dashed rgba(207,10,0,0.25)`,
              backgroundColor: 'rgba(207,10,0,0.04)',
              cursor: 'pointer', color: RED,
              fontFamily: FONT, fontSize: 14, fontWeight: 600,
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke={RED} strokeWidth="1.5"/>
              <path d="M10 6V14M6 10H14" stroke={RED} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add subtask
          </button>

          {subtasks.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 12, padding: '10px 14px',
              backgroundColor: 'rgba(207,10,0,0.06)', borderRadius: 12,
            }}>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
                {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: RED }}>
                {fmtHrs(subtaskTotalHrs)} total
              </span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: 18,
            backgroundColor: submitted ? '#3A9E3A' : RED,
            color: '#fff', border: 'none',
            borderRadius: 999, fontSize: 17, fontWeight: 700,
            fontFamily: FONT, cursor: 'pointer', letterSpacing: '0.01em',
            boxShadow: submitted
              ? '0 8px 24px rgba(58,158,58,0.3)'
              : '0 8px 24px rgba(207,10,0,0.28)',
            transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e   => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onTouchEnd={e   => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {submitted ? '✓ Task added!' : "Let's get to work"}
        </button>
      </div>
    </div>
  )
}
