// ─────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────

/** Returns midnight of today (local time) */
export function todayMidnight() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function dateLabel(iso) {
  const d     = new Date(iso)
  const today = todayMidnight()
  const dMid  = new Date(d); dMid.setHours(0,0,0,0)
  const diff  = Math.round((dMid - today) / 86400000)
  if (diff === 0)  return 'Today'
  if (diff === 1)  return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return `${d.getDate()} ${['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]}`
}

/** Returns time portion of an ISO deadline as "9:00 AM" */
export function formatTime(iso) {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes()
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return m === 0
    ? `${h12} ${period}`
    : `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Returns deadline formatted as "dd/mm/yy" */
export function formatDeadlineFull(iso) {
  const d  = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(2)
  return `${dd}/${mm}/${yy}`
}

// ─────────────────────────────────────────────
// DURATION
// ─────────────────────────────────────────────

export function formatDuration(mins) {
  if (!mins && mins !== 0) return '—'
  if (mins < 60) return `${mins} mins work`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} hr ${m} mins work` : `${h} hr work`
}

// ─────────────────────────────────────────────
// MISC
// ─────────────────────────────────────────────

/** Returns a Date `minutesFromNow` minutes in the future */
export function makeDueDate(minutesFromNow) {
  return new Date(Date.now() + minutesFromNow * 60_000)
}
