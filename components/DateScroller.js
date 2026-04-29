'use client'

import { useRef, useEffect, useCallback } from 'react'

const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ITEM_WIDTH = 56 // px — width of each date item

export default function DateScroller({ selectedDate, onDateChange }) {
  const scrollRef = useRef(null)
  const today     = new Date()
  const currentYear  = today.getFullYear()
  const currentMonth = today.getMonth()

  // 31 dates centred on today (15 before, 15 after)
  const dates = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(currentYear, currentMonth, today.getDate() - 15 + i)
    return {
      day:     d.getDate(),
      dayName: DAYS[d.getDay()],
      date:    d,
      key:     d.toDateString(),
    }
  })

  const selectedIndex = dates.findIndex(
    d => d.day === selectedDate.day &&
         d.date.getMonth() === selectedDate.date.getMonth()
  )

  const scrollToIndex = useCallback((index) => {
    const el = scrollRef.current
    if (!el) return
    const containerWidth = el.clientWidth
    const offset = index * ITEM_WIDTH - containerWidth / 2 + ITEM_WIDTH / 2
    el.scrollTo({ left: offset, behavior: 'smooth' })
  }, [])

  // Initial scroll on mount — instant, no animation
  useEffect(() => {
    if (selectedIndex < 0) return
    const el = scrollRef.current
    if (!el) return
    const containerWidth = el.clientWidth
    el.scrollLeft = selectedIndex * ITEM_WIDTH - containerWidth / 2 + ITEM_WIDTH / 2
  }, []) // intentionally runs once on mount

  // Smooth scroll whenever selectedIndex changes after mount
  useEffect(() => {
    if (selectedIndex >= 0) scrollToIndex(selectedIndex)
  }, [selectedIndex, scrollToIndex])

  const handleDateClick = (dateObj, index) => {
    onDateChange(dateObj)
    scrollToIndex(index)
  }

  return (
    <div style={{ position: 'relative', fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Left fade */}
      <div
        style={{
          position: 'absolute', left: 0, top: 32, bottom: 0,
          width: 48, zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))',
        }}
      />
      {/* Right fade */}
      <div
        style={{
          position: 'absolute', right: 0, top: 32, bottom: 0,
          width: 48, zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))',
        }}
      />

      {/* Scroll row */}
      <div
        ref={scrollRef}
        className="scrollbar-hide"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: 0,
          padding: '4px 16px 8px',
        }}
      >
        {dates.map((dateObj, index) => {
          const isSelected =
            dateObj.day === selectedDate.day &&
            dateObj.date.getMonth() === selectedDate.date.getMonth()

          return (
            <button
              key={dateObj.key}
              onClick={() => handleDateClick(dateObj, index)}
              style={{
                flexShrink: 0,
                width: `${ITEM_WIDTH}px`,
                padding: '4px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                scrollSnapAlign: 'center',
              }}
            >
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                color: isSelected ? '#CF0A00' : '#999',
                marginBottom: 4,
              }}>
                {dateObj.dayName}
              </span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  fontWeight: isSelected ? 700 : 400,
                  backgroundColor: isSelected ? '#CF0A00' : 'transparent',
                  color: isSelected ? '#fff' : '#1a1a1a',
                  transition: 'all 0.2s ease',
                }}
              >
                {dateObj.day}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
