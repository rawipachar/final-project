'use client'

import { useState } from 'react'
import CalendarDay from './CalendarDay'

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getTasksForDate(tasks, year, month, day) {
  return tasks.filter((t) => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
  })
}

function buildCalendarGrid(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1)
  // Monday = 0 ... Sunday = 6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6 // Sunday becomes 6

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells = []

  // Prefix cells from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false, month: month - 1, year: month === 0 ? year - 1 : year })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, month, year })
  }

  // Suffix cells to complete last row
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, month: month + 1, year: month === 11 ? year + 1 : year })
  }

  return cells
}

export default function Calendar({ tasks = [], selectedDate, onDateSelect }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const cells = buildCalendarGrid(viewYear, viewMonth)
  const rows = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const isToday = (cell) =>
    cell.currentMonth &&
    cell.day === today.getDate() &&
    cell.month === today.getMonth() &&
    cell.year === today.getFullYear()

  const isSelected = (cell) => {
    if (!selectedDate) return false
    const sd = new Date(selectedDate)
    return (
      cell.day === sd.getDate() &&
      cell.month === sd.getMonth() &&
      cell.year === sd.getFullYear()
    )
  }

  const isPast = (cell) => {
    const cellDate = new Date(cell.year, cell.month, cell.day)
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return cellDate < todayMid
  }

  const isWeekend = (colIndex) => colIndex >= 5 // Sa, Su (0-indexed Mo-Su)

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}>
      {/* Month Header */}
      <div className="flex items-center justify-center mb-5" style={{ position: 'relative' }}>
        {/* Prev Arrow */}
        <button
          onClick={goToPrev}
          className="absolute left-0 flex items-center justify-center rounded-full"
          style={{
            width: '32px', height: '32px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
          }}
          aria-label="Previous month"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Month pill */}
        <div
          style={{
            backgroundColor: '#CF0A00',
            borderRadius: '999px',
            padding: '5px 22px',
          }}
        >
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px' }}>
            {MONTH_NAMES[viewMonth]}
          </span>
        </div>

        {/* Next Arrow */}
        <button
          onClick={goToNext}
          className="absolute right-0 flex items-center justify-center rounded-full"
          style={{
            width: '32px', height: '32px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Next month"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M1 1L7 7L1 13" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: '6px',
        }}
      >
        {WEEK_DAYS.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: '500',
              color: i >= 5 ? '#3AACE0' : '#9E9E9E',
              paddingBottom: '4px',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
            }}
          >
            {row.map((cell, ci) => {
              const cellTasks = getTasksForDate(tasks, cell.year, cell.month, cell.day)
              return (
                <div key={`${cell.year}-${cell.month}-${cell.day}-${ci}`} style={{ display: 'flex', justifyContent: 'center' }}>
                  <CalendarDay
                    day={cell.day}
                    isCurrentMonth={cell.currentMonth}
                    isSelected={isSelected(cell)}
                    isToday={isToday(cell)}
                    isWeekend={isWeekend(ci)}
                    isPast={isPast(cell)}
                    tasks={cellTasks}
                    onSelect={(d) => {
                      const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                      onDateSelect(dateStr)
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
