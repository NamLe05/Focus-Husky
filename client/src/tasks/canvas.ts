import {CANVAS_BASE_URL} from './model';

export function retrieveAssignments() {
  // Canvas will maintain an updated state of tasks for up to 3 months (~1 quarter)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  // First, we need to query all the planner items.
  const api = `${CANVAS_BASE_URL}/api/v1/planner/items?start_date=${startDate.toISOString()}&per_page=1000`;

  // We need to handle a paginated request (1000 per page)
}
