'use client'

import { useRef, useEffect, useCallback } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ITEM_WIDTH = 56 // px - width of each date item including gap

export default function DateScroller({ selectedDate, onDateChange }) {
  const scrollRef = useRef(null)
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Generate dates: 15 days before and 15 days after today
  const dates = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(currentYear, currentMonth, today.getDate() - 15 + i)
    return {
      day: d.getDate(),
      dayName: DAYS[d.getDay()],
      date: d,
      key: d.toDateString(),
    }
  })

  const selectedIndex = dates.findIndex(
    (d) => d.day === selectedDate.day &&
      d.date.getMonth() === selectedDate.date.getMonth()
  )

  const scrollToIndex = useCallback((index) => {
    const el = scrollRef.current
    if (!el) return
    const containerWidth = el.clientWidth
    const offset = index * ITEM_WIDTH - containerWidth / 2 + ITEM_WIDTH / 2
    el.scrollTo({ left: offset, behavior: 'smooth' })
  }, [])

  // Initial scroll to selected date
  useEffect(() => {
    if (selectedIndex >= 0) {
      const el = scrollRef.current
      if (!el) return
      const containerWidth = el.clientWidth
      const offset = selectedIndex * ITEM_WIDTH - containerWidth / 2 + ITEM_WIDTH / 2
      el.scrollLeft = offset
    }
  }, [selectedIndex])

  const handleDateClick = (dateObj, index) => {
    onDateChange(dateObj)
    scrollToIndex(index)
  }

  return (
    <div className="relative">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))',
        }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))',
        }}
      />

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-4"
        style={{ gap: '0px' }}
      >
        {dates.map((dateObj, index) => {
          const isSelected =
            dateObj.day === selectedDate.day &&
            dateObj.date.getMonth() === selectedDate.date.getMonth()

          return (
            <button
              key={dateObj.key}
              onClick={() => handleDateClick(dateObj, index)}
              className="flex-shrink-0 flex flex-col items-center justify-center focus:outline-none"
              style={{ width: `${ITEM_WIDTH}px`, padding: '4px 0' }}
            >
              <span
                className="text-xs mb-1 font-medium"
                style={{ color: isSelected ? '#CF0A00' : '#999', fontSize: '11px' }}
              >
                {dateObj.dayName}
              </span>
              <div
                className="flex items-center justify-center rounded-full font-semibold transition-all duration-200"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: isSelected ? '#CF0A00' : 'transparent',
                  color: isSelected ? '#fff' : '#1a1a1a',
                  fontSize: '17px',
                  fontWeight: isSelected ? '700' : '400',
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
