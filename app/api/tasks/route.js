// /app/api/tasks/route.js
// Mock API – returns tasks with subtasks for the Detail View

export async function GET() {
  const today = new Date()

  const tasks = [
    {
      id: 1,
      title: 'Almost Final',
      priority: 'high',
      emoji: '🧶',
      totalDuration: 72,       // hours (sum of subtask durations)
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
      deadline: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        18, 0
      ).toISOString(),
      subtasks: [
        {
          id: 1,
          title: 'Research',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
          duration: 2,       // hours
          completed: true,
        },
        {
          id: 2,
          title: 'Draft1',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
          duration: 3,
          completed: false,
        },
        {
          id: 3,
          title: 'Prototype',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
          duration: 10,
          completed: false,
        },
        {
          id: 4,
          title: 'Actual work',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
          duration: 24,
          completed: false,
        },
      ],
    },
    {
      id: 2,
      title: 'Draft 2',
      priority: 'medium',
      emoji: '🧶',
      totalDuration: 80,
      description: 'Review and finalize the second draft for client approval.',
      deadline: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        20, 0
      ).toISOString(),
      subtasks: [
        {
          id: 1,
          title: 'Outline',
          description: 'Create a rough structure and outline for the draft',
          duration: 10,
          completed: false,
        },
        {
          id: 2,
          title: 'First Pass',
          description: 'Write the initial version without editing',
          duration: 25,
          completed: false,
        },
        {
          id: 3,
          title: 'Review',
          description: 'Self-review and gather feedback from teammates',
          duration: 15,
          completed: false,
        },
        {
          id: 4,
          title: 'Final Polish',
          description: 'Address feedback and polish the final version',
          duration: 30,
          completed: false,
        },
      ],
    },
    {
      id: 3,
      title: 'Draft 6',
      priority: 'low',
      emoji: '✏️',
      totalDuration: 20,
      description: 'Low priority draft for later in the week.',
      deadline: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 2,
        12, 0
      ).toISOString(),
      subtasks: [
        {
          id: 1,
          title: 'Brief',
          description: 'Read through the brief and take notes',
          duration: 5,
          completed: false,
        },
        {
          id: 2,
          title: 'Draft',
          description: 'Write the draft document',
          duration: 15,
          completed: false,
        },
      ],
    },
  ]

  return Response.json({ tasks })
}
