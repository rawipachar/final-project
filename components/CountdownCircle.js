'use client'

import { useState, useEffect, useRef } from 'react'

export default function CountdownCircle({ dueDate, totalDuration }) {
  const [remaining, setRemaining] = useState(0)
  const [progress, setProgress] = useState(1)
  const [isUrgent, setIsUrgent] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const intervalRef = useRef(null)

  // Circle geometry
  const size = 220
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const due = dueDate instanceof Date ? dueDate.getTime() : dueDate
      const totalMs = totalDuration * 60 * 1000
      const remainingMs = due - now

      if (remainingMs <= 0) {
        setRemaining(0)
        setProgress(0)
        setIsDone(true)
        clearInterval(intervalRef.current)
        return
      }

      const remainingMins = Math.ceil(remainingMs / 60000)
      const prog = Math.max(0, Math.min(1, remainingMs / totalMs))

      setRemaining(remainingMins)
      setProgress(prog)
      setIsDone(false)
      setIsUrgent(prog < 0.25)
    }

    update()
    intervalRef.current = setInterval(update, 1000)
    return () => clearInterval(intervalRef.current)
  }, [dueDate, totalDuration])

  const dashOffset = circumference * (1 - progress)
  const ringColor = '#CF0A00'

  return (
    <div className="flex items-center justify-center my-4">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* SVG Progress Ring */}
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F0E8E8"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`countdown-ring ${isUrgent && !isDone ? 'pulse-urgent' : ''}`}
          />
        </svg>

        {/* Inner white circle */}
        <div
          className="absolute rounded-full bg-white flex flex-col items-center justify-center"
          style={{
            width: size - strokeWidth * 2 - 8,
            height: size - strokeWidth * 2 - 8,
            boxShadow: '0 2px 20px rgba(207, 10, 0, 0.08)',
          }}
        >
          {isDone ? (
            <div className="flex flex-col items-center gap-1">
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#CF0A00',
                  fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                }}
              >
                Time&apos;s up
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center" style={{ gap: '2px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#888',
                  fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                  letterSpacing: '0.01em',
                }}
              >
                work is due in
              </span>
              <span
                style={{
                  fontSize: '52px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  lineHeight: '1',
                  fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {remaining}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#888',
                  fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                }}
              >
                minutes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
