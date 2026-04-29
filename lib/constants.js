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

/** Raw hex colors keyed by priority — single source of truth */
export const PRIORITY_COLORS = {
  highest: '#CF0A00',
  high:    '#CF0A00',
  medium:  '#CC4139',
  low:     '#D06761',
}

/** Badge styles for all pages */
export const PRIORITY_BADGE = {
  highest: { label: 'High',   bg: '#CF0A00', text: '#fff' },
  high:    { label: 'High',   bg: '#CF0A00', text: '#fff' },
  medium:  { label: 'Medium', bg: '#CC4139', text: '#fff' },
  low:     { label: 'Low',    bg: '#D06761', text: '#fff' },
}
