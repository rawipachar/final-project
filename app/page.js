'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import DateScroller      from '@/components/DateScroller'
import CountdownCircle   from '@/components/CountdownCircle'
import FloatingAddButton from '@/components/FloatingAddButton'
import HomeCard          from '@/components/HomeCard'
import TaskListCard      from '@/components/TaskListCard'
import DetailView        from '@/components/DetailView'
import TaskPanel         from '@/components/TaskPanel'

import { FONT, RED, GRAY, MONTH_NAMES, PRIORITY_WEIGHT } from '@/lib/constants'
import { todayMidnight, dateLabel, formatDuration, makeDueDate }      from '@/lib/utils'
import { globalTasks, getNextId }                                      from '@/lib/taskStore'

// ═══════════════════════════════════════════════════════════════
// PAGE 1 — HOME
// ═══════════════════════════════════════════════════════════════

function HomePage({ tasks, onTasksChange }) {
  const router  = useRouter()
  const today   = new Date()

  const [selDate, setSelDate] = useState({
    day:     today.getDate(),
    dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][today.getDay()],
    date:    today,
    key:     today.toDateString(),
  })
  const [mounted,     setMounted]     = useState(false)
  const [expandedId,  setExpandedId]  = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => { setMounted(true) }, [])

  // Determine if selected date is today
  const todayMid = todayMidnight()
  const selMid   = new Date(selDate.date)
  selMid.setHours(0, 0, 0, 0)
  const isToday = selMid.getTime() === todayMid.getTime()

  // Filter tasks whose deadline matches the selected date
  const tasksForDate = tasks.filter(t => {
    const d = new Date(t.deadline); d.setHours(0,0,0,0)
    return d.getTime() === selMid.getTime()
  })

  // Urgent task: first high/highest on today only
  const urgentTask = isToday
    ? tasksForDate.find(t => t.priority === 'high' || t.priority === 'highest')
    : null

  // Upcoming: all date-filtered tasks except the urgent one
  const upcomingTasks = tasksForDate.filter(t => t.id !== urgentTask?.id)

  const countdown = urgentTask
    ? { dueDate: new Date(urgentTask.deadline), totalDuration: urgentTask.duration }
    : { dueDate: makeDueDate(120), totalDuration: 120 }

  // Format duration for display inside HomeCard
  const toCardShape = (t) => ({ ...t, duration: formatDuration(t.duration) })

  const handleCardToggle = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleDateChange = (d) => {
    setSelDate(d)
    setExpandedId(null)
  }

  const handleSave = (updated) => {
    if (onTasksChange) {
      const next = updated.id
        ? tasks.map(t => t.id === updated.id ? updated : t)
        : [{ ...updated, id: getNextId() }, ...tasks]
      onTasksChange(next)
    }
    setEditingTask(null)
  }

  const headingLabel = dateLabel(selDate.date.toISOString())

  return (
    <div style={{
      fontFamily: FONT,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: 120,
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ padding: '52px 24px 8px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: '#999', fontWeight: 400, margin: 0 }}>
              {MONTH_NAMES[selDate.date.getMonth()]} {selDate.date.getFullYear()}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: 0, lineHeight: 1.1 }}>
              {headingLabel}
            </h1>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #DAEAF4, #b8d5ec)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🙂</div>
        </div>
      </div>

      <DateScroller selectedDate={selDate} onDateChange={handleDateChange} />
      <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '0 24px' }} />

      {/* Urgent section — only shown on Today */}
      {isToday && (
        <div style={{ padding: '24px 24px 0', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Urgent</h2>
          </div>

          {mounted && (
            <CountdownCircle
              dueDate={countdown.dueDate}
              totalDuration={countdown.totalDuration}
            />
          )}

          {urgentTask && (
            <div style={{ marginTop: 16 }}>
              <HomeCard
                task={toCardShape(urgentTask)}
                variant="urgent"
                isExpanded={expandedId === urgentTask.id}
                onToggle={() => handleCardToggle(urgentTask.id)}
                onEdit={setEditingTask}
              />
            </div>
          )}
        </div>
      )}

      {/* Upcoming section */}
      <div style={{ padding: '32px 24px 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Up coming</h2>
          {upcomingTasks.length > 0 && (
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              backgroundColor: GRAY, color: '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>
              {upcomingTasks.length}
            </span>
          )}
        </div>

        {upcomingTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
            <p style={{ fontSize: 14, margin: 0, fontWeight: 500 }}>No tasks for this day</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingTasks.map(t => (
              <HomeCard
                key={t.id}
                task={toCardShape(t)}
                variant="upcoming"
                isExpanded={expandedId === t.id}
                onToggle={() => handleCardToggle(t.id)}
                onEdit={setEditingTask}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ paddingTop: 32 }}>
        <FloatingAddButton onClick={() => router.push('/add-task')} />
      </div>

      {/* TaskPanel for inline edits from Home */}
      {editingTask && (
        <TaskPanel task={editingTask} onSave={handleSave} onClose={() => setEditingTask(null)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE 2 — TASK LIST
// ═══════════════════════════════════════════════════════════════

function TaskListPage({ tasks, onTasksChange }) {
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [detail,   setDetail]   = useState(null)
  const [editing,  setEditing]  = useState(null)

  const handleCardTap = (task) => {
    if (expanded === task.id) setDetail(task)
    else setExpanded(task.id)
  }

  const handleSave = (updated) => {
    const next = tasks.map(t => t.id === updated.id ? updated : t)
    onTasksChange(next)
    setEditing(null)
    if (detail?.id === updated.id) setDetail(updated)
  }

  const getFiltered = () => {
    if (filter === 'high') {
      return [...tasks]
        .filter(t => t.priority === 'high' || t.priority === 'highest')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    }
    if (filter === 'recommend') {
      const now = Date.now()
      return [...tasks].sort((a, b) => {
        const hoursA = Math.max(1, (new Date(a.deadline) - now) / 3_600_000)
        const hoursB = Math.max(1, (new Date(b.deadline) - now) / 3_600_000)
        const sA = (PRIORITY_WEIGHT[a.priority] || 1) * (a.duration || 1) / hoursA
        const sB = (PRIORITY_WEIGHT[b.priority] || 1) * (b.duration || 1) / hoursB
        return sB - sA
      })
    }
    return [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  }

  const getGrouped = (sorted) => {
    if (filter !== 'all') return null
    const map = {}
    sorted.forEach(t => {
      const lbl = dateLabel(t.deadline)
      if (!map[lbl]) map[lbl] = []
      map[lbl].push(t)
    })
    const priority = ['Today', 'Tomorrow']
    const result   = []
    const seen     = new Set()
    priority.forEach(k => {
      if (map[k]) { result.push({ label: k, items: map[k] }); seen.add(k) }
    })
    Object.keys(map).forEach(k => {
      if (!seen.has(k)) result.push({ label: k, items: map[k] })
    })
    return result
  }

  const filtered = getFiltered()
  const grouped  = getGrouped(filtered)

  const FilterBtn = ({ id, label }) => (
    <button
      onClick={() => { setFilter(id); setExpanded(null) }}
      style={{
        padding: '8px 18px',
        borderRadius: 999,
        cursor: 'pointer',
        border: filter === id ? 'none' : '1.5px solid #D4DDE8',
        backgroundColor: filter === id ? RED : 'transparent',
        color: filter === id ? '#fff' : '#888',
        fontSize: 14,
        fontWeight: filter === id ? 700 : 500,
        fontFamily: FONT,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  )

  const renderCard = (task) => (
    <TaskListCard
      key={task.id}
      task={task}
      isExpanded={expanded === task.id}
      onToggle={() => handleCardTap(task)}
      onEdit={(t) => { setExpanded(null); setEditing(t) }}
    />
  )

  return (
    <div style={{ fontFamily: FONT, height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{
        padding: '52px 24px 16px',
        boxSizing: 'border-box',
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Task</h1>
      </div>

      {/* Filter pills */}
      <div
        style={{ display: 'flex', gap: 10, padding: '0 24px 20px', overflowX: 'auto' }}
        className="scrollbar-hide"
      >
        <FilterBtn id="all"       label="All task" />
        <FilterBtn id="high"      label="High risk" />
        <FilterBtn id="recommend" label="Recommendations" />
      </div>

      {/* Recommendation banner */}
      {filter === 'recommend' && (
        <div style={{
          margin: '0 20px 16px', padding: '11px 16px', borderRadius: 14,
          backgroundColor: '#FFFBEA', border: '1px solid #F5DC70',
          boxSizing: 'border-box',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#7A6000', fontWeight: 500 }}>
            ✨ Sorted by urgency — high priority, long tasks due soon come first.
          </p>
        </div>
      )}

      {/* Task list */}
      <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>
        {filter === 'all' && grouped ? (
          grouped.map(g => (
            <div key={g.label} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px 2px' }}>
                {g.label}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {g.items.map(renderCard)}
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(renderCard)}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#ccc' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 16, margin: 0, fontWeight: 500 }}>No tasks here</p>
          </div>
        )}
      </div>

      {/* Overlays */}
      {detail && (
        <DetailView
          task={detail}
          onClose={() => setDetail(null)}
          onEdit={(t) => { setDetail(null); setEditing(t) }}
        />
      )}
      {editing && (
        <TaskPanel task={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROOT — two-page swipeable shell
// ═══════════════════════════════════════════════════════════════

export default function RootPage() {
  const [page,     setPage]     = useState(0)
  const [tasks,    setTasks]    = useState(() => [...globalTasks])
  const [drag,     setDrag]     = useState(0)
  const [dragging, setDragging] = useState(false)
  const [pageW,    setPageW]    = useState(430)

  const startX = useRef(null)
  const startY = useRef(null)

  // Refresh tasks from the shared store on mount and on window focus
  useEffect(() => {
    const refresh = () => setTasks([...globalTasks])
    refresh() // initial sync in case store was mutated before mount
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  // Keep page width in sync with viewport
  useEffect(() => {
    const update = () => setPageW(Math.min(window.innerWidth, 430))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Arrow-key navigation for desktop testing
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  setPage(0)
      if (e.key === 'ArrowRight') setPage(1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const handleTasksChange = useCallback((next) => {
    setTasks(next)
    // Write back into the shared store so add-task page and focus refresh stay in sync
    globalTasks.length = 0
    next.forEach(t => globalTasks.push(t))
  }, [])

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    setDragging(true)
  }, [])

  const onTouchMove = useCallback((e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    const dy = Math.abs(e.touches[0].clientY - startY.current)
    if (dy > Math.abs(dx) * 1.2) return
    if (page === 0 && dx > 0) return
    if (page === 1 && dx < 0) return
    setDrag(dx)
  }, [page])

  const onTouchEnd = useCallback(() => {
    if (drag < -55 && page === 0) setPage(1)
    else if (drag > 55 && page === 1) setPage(0)
    setDrag(0)
    setDragging(false)
    startX.current = null
  }, [drag, page])

  const translateX = -page * pageW + drag

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto',
      height: '100vh', overflow: 'hidden',
      position: 'relative', backgroundColor: '#fff', fontFamily: FONT,
    }}>
      {/* Sliding track */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: 'flex',
          width: '200%',
          height: '100%',
          transform: `translateX(${translateX}px)`,
          transition: dragging ? 'none' : 'transform 0.36s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}
      >
        {/* Page 1 — Home */}
        <div style={{ width: '50%', height: '100%', flexShrink: 0, overflow: 'hidden' }}>
          <HomePage tasks={tasks} onTasksChange={handleTasksChange} />
        </div>

        {/* Page 2 — Task List */}
        <div style={{ width: '50%', height: '100%', flexShrink: 0, overflow: 'hidden' }}>
          <TaskListPage tasks={tasks} onTasksChange={handleTasksChange} />
        </div>
      </div>

      {/* Pagination dots */}
      <div style={{
        position: 'fixed', bottom: 28,
        left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, alignItems: 'center', zIndex: 100,
      }}>
        {[0, 1].map(i => (
          <div
            key={i}
            onClick={() => setPage(i)}
            style={{
              height: 8, borderRadius: 999, cursor: 'pointer',
              width: i === page ? 20 : 8,
              backgroundColor: i === page ? RED : '#D0D0D0',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
