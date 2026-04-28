'use client'

const PRIORITY_COLORS = {
  high: '#CF0A00',
  highest: '#CF0A00',
  medium: '#CC4139',
  low: '#D06761',
}

export default function TaskDots({ tasks = [] }) {
  if (!tasks || tasks.length === 0) return <div style={{ height: '8px' }} />

  // Show max 3 dots
  const visible = tasks.slice(0, 3)

  return (
    <div
      className="flex items-center justify-center"
      style={{ gap: '3px', height: '8px', marginTop: '2px' }}
    >
      {visible.map((task, i) => (
        <div
          key={task.id ?? i}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: PRIORITY_COLORS[task.priority] ?? '#CC4139',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}
