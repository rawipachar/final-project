// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
export const FONT       = '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
export const RED        = '#CF0A00'
export const LIGHT_BLUE = '#DAEAF4'
export const GRAY       = '#F5F5F3'

// ─────────────────────────────────────────────
// DATE / TIME
// ─────────────────────────────────────────────
export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const SHORT_MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
]

// ─────────────────────────────────────────────
// PRIORITY
// ─────────────────────────────────────────────

/** Numeric weight used for the Recommendations sort */
export const PRIORITY_WEIGHT = { highest: 3, high: 3, medium: 2, low: 1 }

/** Badge colours for the Task List page */
export const PRIORITY_BADGE = {
  highest: { label: 'High',   bg: RED,       text: '#fff' },
  high:    { label: 'High',   bg: RED,       text: '#fff' },
  medium:  { label: 'Medium', bg: '#E8781A', text: '#fff' },
  low:     { label: 'Low',    bg: '#D4A017', text: '#fff' },
}

/** Badge colours for the Home page cards */
export const HOME_PRIORITY_STYLES = {
  highest: { label: 'highest', bg: 'rgba(207,10,0,0.12)',   color: RED },
  high:    { label: 'high',    bg: 'rgba(207,10,0,0.08)',   color: RED },
  medium:  { label: 'Medium',  bg: 'rgba(91,143,255,0.15)', color: '#3B6FD4' },
  low:     { label: 'Low',     bg: 'rgba(100,180,100,0.15)',color: '#3A9E3A' },
}
