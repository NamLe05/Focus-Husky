import {TaskModel, TaskState, TaskId, TaskStatus} from './model';

export class TaskController {
  // Collection of all user tasks
  private tasks: Map<TaskId, TaskModel>;

  // TEMPORARY: Collect user token for testing purposes.
  private userToken?: string;

  // View update callback
  // Send latest list of tasks to the client
  private viewUpdateCallback: (tasks: TaskState[]) => void;

  /**
   * Create a new task controller instance
   * @param viewUpdateCallback Callback to notify view of updates
   */
  constructor(viewUpdateCallback: (tasks: TaskState[]) => void) {
    this.tasks = new Map();
    this.viewUpdateCallback = viewUpdateCallback;
    this.userToken = undefined;

    // TODO: Load existing tasks from database.

    // Query new tasks from Canvas.
  }

  /**
   * Handle create task user action
   */
  public handleCreateTask(
    title: string,
    description: string,
    course: string,
    deadline: Date,
    link?: URL,
  ) {
    // Create task using task model
    const createdTask = new TaskModel(
      title,
      description,
      course,
      deadline,
      link,
    );
    // Get task ID
    const createdTaskId = createdTask.getId();
    // Save task in temporary state
    this.tasks.set(createdTaskId, createdTask);
    // Save task to database
    this.saveTaskToDatabase(createdTaskId);
  }

  public handleTaskUpdate(
    id: TaskId,
    title: string,
    description: string,
    course: string,
    deadline: Date,
    link?: URL,
    status?: TaskStatus,
  ) {
    const taskToUpdate = this.tasks.get(id);
    taskToUpdate.setState({
      title,
      description,
      course,
      deadline,
      link,
      status,
    });
  }

  private saveTaskToDatabase(taskId: TaskId): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    console.log(`Saving task ${taskId} to database:`, task.getState());
    // TODO: call database APIs
  }

  private retrieveAssignments() {
    if (this.userToken === undefined) return;
    // Call the IPC
  }

  public handleTokenUpdate(token: string) {
    this.userToken = token;
  }
}
