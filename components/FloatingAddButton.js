'use client'

import { useState } from 'react'

export default function FloatingAddButton({ onClick }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div className="flex justify-center pb-4 pt-2">
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        onClick={onClick}
        className="float-in flex items-center justify-center rounded-full focus:outline-none"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#DAEAF4',
          transform: pressed ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease',
          boxShadow: pressed
            ? '0 2px 8px rgba(0,0,0,0.08)'
            : '0 6px 24px rgba(0,0,0,0.10)',
        }}
        aria-label="Add new task"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
