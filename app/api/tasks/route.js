// Serves the current globalTasks so DetailView can fall back to the API
// when a task object doesn't carry embedded subtasks.

import { globalTasks } from '@/lib/taskStore'

export async function GET() {
  return Response.json({ tasks: globalTasks })
}
