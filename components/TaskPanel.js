'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FONT, RED, GRAY } from '@/lib/constants'

/**
 * TaskPanel
 * Bottom-sheet form for creating a new task or editing an existing one.
 * Pass `task={null}` for "New Task" mode.
 *
 * Props:
 *   task    – task object to pre-fill (or null for new)
 *   onSave  – called with the saved task object
 *   onClose – called when the backdrop or ✕ is tapped
 */
export default function TaskPanel({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       task?.title       || '',
    priority:    task?.priority    || 'high',
    hours:       task ? Math.floor((task.duration || 0) / 60) : 0,
    minutes:     task ? (task.duration || 0) % 60             : 0,
    description: task?.description || '',
    deadline:    task?.deadline
      ? task.deadline.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    dueTime:     task?.deadline?.slice(11, 16) || '09:00',
  })
  const [saving, setSaving] = useState(false)

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  const inputStyle = {
    backgroundColor: GRAY,
    border: 'none',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: 15,
    color: '#1a1a1a',
    fontFamily: FONT,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#5A7A9A',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    setSaving(true)
    const duration = parseInt(form.hours || 0) * 60 + parseInt(form.minutes || 0)
    const deadline = `${form.deadline}T${form.dueTime}:00`

    setTimeout(() => {
      onSave({
        ...(task || {}),
        title:       form.title.trim(),
        priority:    form.priority,
        duration,
        description: form.description,
        deadline,
        emoji:       task?.emoji || '🧶',
      })
    }, 300)
  }

  const priorityColor =
    form.priority === 'high' || form.priority === 'highest'
      ? RED
      : form.priority === 'medium'
      ? '#E8781A'
      : '#D4A017'

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontFamily: FONT,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          backgroundColor: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '20px 20px 44px',
          maxHeight: '88vh',
          overflowY: 'auto',
          animation: 'panelUp 0.3s cubic-bezier(0.34,1.1,0.64,1)',
        }}
      >
        <style>{`
          @keyframes panelUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
          input[type=date]::-webkit-calendar-picker-indicator,
          input[type=time]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        `}</style>

        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            backgroundColor: '#E0E0E0',
            margin: '0 auto 20px',
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {task ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              color: '#bbb',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Task name */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Task Name</label>
          <input
            type="text"
            placeholder="What's on your deadline"
            style={inputStyle}
            autoFocus
            {...f('title')}
          />
        </div>

        {/* Deadline + Due Time + Priority */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" style={{ ...inputStyle, fontSize: 12, padding: '12px 10px' }} {...f('deadline')} />
          </div>
          <div>
            <label style={labelStyle}>Time</label>
            <input type="time" style={{ ...inputStyle, fontSize: 12, padding: '12px 10px' }} {...f('dueTime')} />
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select
              style={{
                ...inputStyle,
                appearance: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                padding: '12px 10px',
                color: priorityColor,
              }}
              {...f('priority')}
            >
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
          </div>
        </div>

        {/* Estimated work time */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Estimated Work Time</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['hours', 'HRS', 23], ['minutes', 'MINS', 59]].map(([key, unit, max]) => (
              <div
                key={key}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}
              >
                <input
                  type="number"
                  min="0"
                  max={max}
                  style={{
                    width: 40,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#1a1a1a',
                    textAlign: 'center',
                    outline: 'none',
                    fontFamily: FONT,
                  }}
                  {...f(key)}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: '0.07em' }}>
                  {unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            rows={3}
            placeholder="what you have to do"
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            {...f('description')}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: 18,
            backgroundColor: saving ? '#3A9E3A' : RED,
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT,
            boxShadow: `0 8px 24px ${saving ? 'rgba(58,158,58,0.3)' : 'rgba(207,10,0,0.28)'}`,
            transition: 'background-color 0.3s, box-shadow 0.3s',
          }}
        >
          {saving ? '✓ Saved!' : task ? 'Save Changes' : "Let's get to work"}
        </button>
      </div>
    </div>,
    document.body
  )
}
