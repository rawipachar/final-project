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
      title: 'Almost Final',
      deadline: new Date(n.getFullYear(), n.getMonth(), n.getDate(), 18, 0).toISOString(),
      priority: 'high',
      duration: 70,
      emoji: '🧶',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
    },
    {
      id: 2,
      title: 'Draft 2',
      deadline: new Date(n.getFullYear(), n.getMonth(), n.getDate(), 20, 0).toISOString(),
      priority: 'high',
      duration: 90,
      emoji: '🧶',
      description: 'Review and finalize the second draft for client approval before end of day.',
    },
    {
      id: 3,
      title: 'Draft 2',
      deadline: tom.toISOString(),
      priority: 'medium',
      duration: 160,
      emoji: '🧶',
      description: 'Complete medium priority draft with all client revisions incorporated.',
    },
    {
      id: 4,
      title: 'Draft 2',
      deadline: tom.toISOString(),
      priority: 'high',
      duration: 90,
      emoji: '🧶',
      description: 'High priority version of draft 2 — needs to be done before the meeting.',
    },
    {
      id: 5,
      title: 'Draft 2',
      deadline: d2.toISOString(),
      priority: 'low',
      duration: 80,
      emoji: '🧶',
      description: 'Low priority draft for later in the week, can be pushed if needed.',
    },
  ]
}

// Module-level store so tasks persist across client navigations
export let globalTasks = buildSeedTasks()
export let nextId      = 100
