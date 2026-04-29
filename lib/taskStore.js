// ─────────────────────────────────────────────
// INITIAL TASK DATA
// ─────────────────────────────────────────────

function buildSeedTasks() {
  const n   = new Date()
  const tom = new Date(n); tom.setDate(n.getDate() + 1)
  const d2  = new Date(n); d2.setDate(n.getDate() + 2)

  return [
    {
      id: 1,
      title: 'Final Prototype',
      priority: 'high',
      emoji: '🎨',
      duration: 70,
      description: 'Complete the interactive prototype in Figma with all user flows, transitions, and edge cases covered before the client review session.',
      deadline: new Date(n.getFullYear(), n.getMonth(), n.getDate(), 18, 0).toISOString(),
      subtasks: [
        { id:1, title:'Wireframe review',   description:'Go through all low-fi wireframes and mark revision points', duration:1, completed:true },
        { id:2, title:'Hi-fi screens',      description:'Convert approved wireframes into high-fidelity Figma screens', duration:3, completed:false },
        { id:3, title:'Prototype linking',  description:'Link all screens with correct interaction flows', duration:2, completed:false },
        { id:4, title:'Client handoff',     description:'Export assets and share prototype link with client', duration:1, completed:false },
      ],
    },
    {
      id: 2,
      title: 'API Integration',
      priority: 'high',
      emoji: '🔌',
      duration: 90,
      description: 'Integrate the payment gateway API and test all transaction flows including success, failure, and timeout scenarios.',
      deadline: new Date(n.getFullYear(), n.getMonth(), n.getDate(), 21, 0).toISOString(),
      subtasks: [
        { id:1, title:'Read API docs',      description:'Review Stripe API documentation and auth flow', duration:1, completed:false },
        { id:2, title:'Setup endpoints',    description:'Create POST /payment and webhook handler routes', duration:2, completed:false },
        { id:3, title:'Test transactions',  description:'Run test payments in sandbox environment', duration:2, completed:false },
        { id:4, title:'Error handling',     description:'Handle declined cards, timeouts, and retries', duration:1, completed:false },
      ],
    },
    {
      id: 3,
      title: 'Write Unit Tests',
      priority: 'medium',
      emoji: '🧪',
      duration: 160,
      description: 'Write unit tests for all core utility functions and API route handlers. Aim for at least 80% coverage.',
      deadline: new Date(tom.getFullYear(), tom.getMonth(), tom.getDate(), 12, 0).toISOString(),
      subtasks: [
        { id:1, title:'Setup Jest',         description:'Configure Jest and testing environment', duration:1, completed:false },
        { id:2, title:'Utility tests',      description:'Test all functions in lib/utils.js', duration:3, completed:false },
        { id:3, title:'API route tests',    description:'Mock and test all API handlers', duration:4, completed:false },
        { id:4, title:'Coverage report',    description:'Run coverage and fix gaps above 80%', duration:2, completed:false },
      ],
    },
    {
      id: 4,
      title: 'Design System Audit',
      priority: 'high',
      emoji: '🎯',
      duration: 90,
      description: 'Audit the entire design system for inconsistencies in spacing, typography, and color usage across all components.',
      deadline: new Date(tom.getFullYear(), tom.getMonth(), tom.getDate(), 17, 0).toISOString(),
      subtasks: [
        { id:1, title:'Color audit',        description:'Check all components use only the approved palette', duration:2, completed:false },
        { id:2, title:'Typography check',   description:'Verify font sizes and weights match design tokens', duration:1, completed:false },
        { id:3, title:'Spacing review',     description:'Confirm 8pt grid is applied consistently', duration:2, completed:false },
        { id:4, title:'Update constants',   description:'Fix any deviations found in the audit', duration:1, completed:false },
      ],
    },
    {
      id: 5,
      title: 'User Research Report',
      priority: 'low',
      emoji: '📋',
      duration: 80,
      description: 'Compile findings from the 12 user interviews into a structured report with key insights, pain points, and recommendations.',
      deadline: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 12, 0).toISOString(),
      subtasks: [
        { id:1, title:'Transcribe notes',    description:'Clean up raw notes from all 12 sessions', duration:3, completed:false },
        { id:2, title:'Find patterns',       description:'Group similar feedback into themes', duration:2, completed:false },
        { id:3, title:'Write summary',       description:'Draft the executive summary section', duration:2, completed:false },
        { id:4, title:'Add recommendations', description:'Turn insights into actionable next steps', duration:1, completed:false },
      ],
    },
  ]
}

// Module-level mutable array — same reference is shared across all imports
export const globalTasks = buildSeedTasks()

let _nextId = 100
export function getNextId() { return _nextId++ }

/** Prepend a new task to the shared store */
export function addTaskToStore(task) {
  globalTasks.unshift(task)
}
