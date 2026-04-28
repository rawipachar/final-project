'use client'

import TaskDots from './TaskDots'

export default function CalendarDay({
  day,
  isCurrentMonth,
  isSelected,
  isToday,
  isWeekend,
  isPast,
  tasks,
  onSelect,
}) {
  if (!day) {
    return <div />
  }

  const handleClick = () => {
    if (!isPast && onSelect) onSelect(day)
  }

  let textColor = '#1a1a1a'
  if (!isCurrentMonth) textColor = '#C8C8C8'
  else if (isPast) textColor = '#C0C0C0'
  else if (isWeekend) textColor = '#3AACE0'

  if (isSelected) textColor = '#fff'
  if (isToday && !isSelected) textColor = '#CF0A00'

  return (
    <div
      className="flex flex-col items-center"
      style={{ cursor: isPast ? 'default' : 'pointer' }}
      onClick={handleClick}
    >
      <div
        className="flex items-center justify-center rounded-full transition-all duration-150"
        style={{
          width: '34px',
          height: '34px',
          backgroundColor: isSelected
            ? '#CF0A00'
            : isToday && !isSelected
            ? 'rgba(207, 10, 0, 0.08)'
            : 'transparent',
          fontWeight: isSelected || isToday ? '700' : isCurrentMonth ? '400' : '300',
          fontSize: '15px',
          color: textColor,
          userSelect: 'none',
        }}
      >
        {day}
      </div>
      <TaskDots tasks={tasks} />
    </div>
  )
}
