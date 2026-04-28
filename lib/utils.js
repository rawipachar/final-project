import { SHORT_MONTHS } from './constants'

// ─────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────

/** Returns midnight of today (local time) */
export function todayMidnight() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Returns a human-readable date label:
 *   "Today" | "Tomorrow" | "21 Apr"
 */
export function dateLabel(iso) {
  const d     = new Date(iso)
  const today = todayMidnight()
  const tom   = new Date(today); tom.setDate(today.getDate() + 1)
  const dMid  = new Date(d);    dMid.setHours(0, 0, 0, 0)

  if (dMid.getTime() === today.getTime()) return 'Today'
  if (dMid.getTime() === tom.getTime())   return 'Tomorrow'
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`
}

/**
 * Returns deadline formatted as "dd/mm/yy"
 */
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

/**
 * Converts minutes → readable string:
 *   70  → "70 mins work"
 *   90  → "1 hr 30 mins work"
 *   120 → "2 hr work"
 */
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
