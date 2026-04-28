'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── External components (existing) ───────────────────────────
import DateScroller    from '@/components/DateScroller'
import CountdownCircle from '@/components/CountdownCircle'
import FloatingAddButton from '@/components/FloatingAddButton'

// ─── New shared components ─────────────────────────────────────
import HomeCard      from '@/components/HomeCard'
import TaskListCard  from '@/components/TaskListCard'
import DetailView    from '@/components/DetailView'
import TaskPanel     from '@/components/TaskPanel'

// ─── Constants / utils / store ────────────────────────────────
import { FONT, RED, LIGHT_BLUE, GRAY, MONTH_NAMES, PRIORITY_WEIGHT } from '@/lib/constants'
import { todayMidnight, dateLabel, formatDuration, makeDueDate }      from '@/lib/utils'
import { globalTasks as _seed, nextId as _nextId }                    from '@/lib/taskStore'

// Module-level store (survives client navigations within the session)
let globalTasks = _seed
let nextId      = _nextId

// ═══════════════════════════════════════════════════════════════
// PAGE 1 — HOME
// ═══════════════════════════════════════════════════════════════

function HomePage({ tasks }) {
  const router  = useRouter()
  const today   = new Date()
  const [selDate, setSelDate] = useState({
    day:     today.getDate(),
    dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][today.getDay()],
    date:    today,
    key:     today.toDateString(),
  })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Derive urgent task (today + high priority) and upcoming list
  const todayMid   = todayMidnight()
  const urgentTask = tasks.find(t => {
    const d = new Date(t.deadline); d.setHours(0,0,0,0)
    return d.getTime() === todayMid.getTime() &&
           (t.priority === 'high' || t.priority === 'highest')
  })
  const upcomingTasks = tasks.filter(t => t.id !== urgentTask?.id)

  const countdown = urgentTask
    ? { dueDate: new Date(urgentTask.deadline), totalDuration: urgentTask.duration }
    : { dueDate: makeDueDate(120), totalDuration: 120 }

  // HomeCard expects duration as a formatted string
  const toCardShape = (t) => ({
    ...t,
    priority: t.priority === 'high' ? 'highest' : t.priority,
    duration: formatDuration(t.duration),
  })

  return (
    <div style={{ fontFamily: FONT, height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
      {/* ── Header ── */}
      <div style={{ padding: '52px 24px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: '#999', fontWeight: 400, margin: 0 }}>
              {MONTH_NAMES[selDate.date.getMonth()]} {selDate.date.getFullYear()}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.1 }}>
              Today
            </h1>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #DAEAF4, #b8d5ec)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🙂</div>
        </div>
      </div>

      <DateScroller selectedDate={selDate} onDateChange={setSelDate} />
      <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '0 24px' }} />

      {/* ── Urgent section ── */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Urgent</h2>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            backgroundColor: RED, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>1</span>
        </div>

        {mounted && (
          <CountdownCircle
            dueDate={countdown.dueDate}
            totalDuration={countdown.totalDuration}
          />
        )}

        {urgentTask && (
          <div style={{ marginTop: 16 }}>
            <HomeCard task={toCardShape(urgentTask)} variant="urgent" />
          </div>
        )}
      </div>

      {/* ── Upcoming section ── */}
      <div style={{ padding: '32px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Up coming</h2>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            backgroundColor: GRAY, color: '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>{upcomingTasks.length}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {upcomingTasks.slice(0, 4).map(t => (
            <HomeCard key={t.id} task={toCardShape(t)} variant="upcoming" />
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 32 }}>
        <FloatingAddButton onClick={() => router.push('/add-task')} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE 2 — TASK LIST
// ═══════════════════════════════════════════════════════════════

function TaskListPage({ tasks, onTasksChange }) {
  const [filter,   setFilter]   = useState('all')   // 'all' | 'high' | 'recommend'
  const [expanded, setExpanded] = useState(null)    // id of expanded card
  const [detail,   setDetail]   = useState(null)    // task shown in DetailView
  const [editing,  setEditing]  = useState(null)    // task being edited in TaskPanel
  const [addNew,   setAddNew]   = useState(false)   // TaskPanel in "new" mode

  // ── Tap logic: 1st tap = expand, 2nd tap = full detail ──
  const handleCardTap = (task) => {
    if (expanded === task.id) setDetail(task)
    else setExpanded(task.id)
  }

  // ── Save handler (edit or new) ──
  const handleSave = (updated) => {
    const next = updated.id
      ? tasks.map(t => t.id === updated.id ? updated : t)   // edit
      : [{ ...updated, id: nextId++ }, ...tasks]             // new
    onTasksChange(next)
    globalTasks = next
    setEditing(null)
    setAddNew(false)
    if (detail?.id === updated.id) setDetail(updated)
  }

  // ── Filter & sort ──
  const getFiltered = () => {
    if (filter === 'high') {
      return [...tasks]
        .filter(t => t.priority === 'high' || t.priority === 'highest')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    }
    if (filter === 'recommend') {
      return [...tasks].sort((a, b) => {
        const sA = (PRIORITY_WEIGHT[a.priority] || 1) * (a.duration || 1)
        const sB = (PRIORITY_WEIGHT[b.priority] || 1) * (b.duration || 1)
        return sB - sA
      })
    }
    return [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  }

  // ── Group by date label (All task view only) ──
  const getGrouped = (sorted) => {
    if (filter !== 'all') return null
    const map = {}
    sorted.forEach(t => {
      const label = dateLabel(t.deadline)
      if (!map[label]) map[label] = []
      map[label].push(t)
    })
    // Ensure Today and Tomorrow appear first
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
    <div style={{ fontFamily: FONT, height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
      {/* ── Header ── */}
      <div style={{
        padding: '52px 24px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Task</h1>
        <button
          onClick={() => setAddNew(true)}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            backgroundColor: LIGHT_BLUE, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#1a1a1a',
          }}
        >+</button>
      </div>

      {/* ── Filter pills ── */}
      <div
        style={{ display: 'flex', gap: 10, padding: '0 24px 20px', overflowX: 'auto' }}
        className="scrollbar-hide"
      >
        <FilterBtn id="all"       label="All task" />
        <FilterBtn id="high"      label="High risk" />
        <FilterBtn id="recommend" label="recommendations" />
      </div>

      {/* ── Recommendation info banner ── */}
      {filter === 'recommend' && (
        <div style={{
          margin: '0 20px 16px', padding: '11px 16px', borderRadius: 14,
          backgroundColor: '#FFFBEA', border: '1px solid #F5DC70',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#7A6000', fontWeight: 500 }}>
            ✨ Sorted by impact — tackle high priority, long tasks first.
          </p>
        </div>
      )}

      {/* ── Task list ── */}
      <div style={{ padding: '0 20px' }}>
        {filter === 'all' && grouped ? (
          grouped.map(g => (
            <div key={g.label} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: '0 0 14px 2px' }}>
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

      {/* ── Overlays ── */}
      {detail  && (
        <DetailView
          task={detail}
          onClose={() => setDetail(null)}
          onEdit={(t) => { setDetail(null); setEditing(t) }}
        />
      )}
      {editing && (
        <TaskPanel task={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
      {addNew  && (
        <TaskPanel task={null}    onSave={handleSave} onClose={() => setAddNew(false)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROOT — two-page swipeable shell
// ═══════════════════════════════════════════════════════════════

export default function RootPage() {
  const [page,     setPage]     = useState(0)
  const [tasks,    setTasks]    = useState(globalTasks)
  const [drag,     setDrag]     = useState(0)
  const [dragging, setDragging] = useState(false)
  const [pageW,    setPageW]    = useState(430)

  const startX = useRef(null)
  const startY = useRef(null)

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

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    setDragging(true)
  }, [])

  const onTouchMove = useCallback((e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    const dy = Math.abs(e.touches[0].clientY - startY.current)
    if (dy > Math.abs(dx) * 1.2) return  // vertical scroll takes priority
    if (page === 0 && dx > 0) return     // can't swipe right on first page
    if (page === 1 && dx < 0) return     // can't swipe left on last page
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
      {/* ── Sliding track ── */}
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
        {/* Page 1 */}
        <div style={{ width: '50%', height: '100%', flexShrink: 0, overflow: 'hidden' }}>
          <HomePage tasks={tasks} />
        </div>

        {/* Page 2 */}
        <div style={{ width: '50%', height: '100%', flexShrink: 0, overflow: 'hidden' }}>
          <TaskListPage
            tasks={tasks}
            onTasksChange={(next) => { setTasks(next); globalTasks = next }}
          />
        </div>
      </div>

      {/* ── Pagination dots (clickable) ── */}
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
