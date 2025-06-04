import {v4 as uuid} from 'uuid';
import {CustomDate, mapSubmissionToStatus} from './helpers';
import {CourseId} from './course';

export const CANVAS_BASE_URL = 'https://canvas.uw.edu/';

export type TaskId = string;

export type TaskStatus =
  | 'not started'
  | 'in progress'
  | 'completed'
  | 'submitted'
  | 'evaluated';

export type TaskState = {
  title: string;
  description: string;
  status: TaskStatus;
  course: CourseId;
  deadline: CustomDate;
  imported: boolean;
  link?: URL;
};

export class TaskModel {
  private id: TaskId;
  private state: TaskState;

  public constructor(
    title: string,
    description: string,
    course: CourseId,
    deadline: CustomDate,
    id?: TaskId,
    link?: URL,
    status?: TaskStatus,
    imported = false,
  ) {
    this.id = id === undefined ? uuid() : id;
    if (status === undefined) status = 'not started';
    // Task if imported if an ID is specified by the constructor
    this.state = {
      title,
      description,
      course,
      deadline,
      link,
      imported,
      status,
    };
  }

  public getId(): TaskId {
    return this.id;
  }

  public setId(id: TaskId) {
    this.id = id;
  }

  public getState(): TaskState {
    return this.state;
  }

  public setState(state: TaskState) {
    this.state = state;
  }

  /**
   * Verifies that the current task state is valid
   */
  public isValid(): boolean {
    // Do not allow empty titles or descriptions
    if (!this.state.title) return false;
    if (!this.state.description) return false;

    // Do not allow invalid dates
    if (this.state.deadline.invalid) return false;

    // If no validation errors fail...
    return true;
  }
}

export type CanvasPlannable = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  points_possible: number;
  due_at: string;
};

export type CanvasTaskOverride = {
  id: number;
  plannable_type: string;
  plannable_id: number;
  user_id: number;
  workflow_state: string;
  marked_complete: boolean;
  dismissed: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CanvasSubmission = {
  submitted: boolean;
  excused: boolean;
  graded: boolean;
  late: boolean;
  missing: boolean;
  needs_grading: boolean;
  with_feedback: boolean;
  redo_request: boolean;
  posted_at: string;
};

export type CanvasTask = {
  context_type?: 'Course';
  course_id?: CourseId;
  plannable_id: number;
  planner_override: CanvasTaskOverride;
  submissions: false | CanvasSubmission;
  plannable_date: string;
  plannable: CanvasPlannable;
  html_url: string;
  context_name: string;
  context_image: string;
};

export class CanvasTaskModel extends TaskModel {
  private canvas_data: CanvasTask;

  public constructor(canvas_data: CanvasTask) {
    super(
      canvas_data.plannable.title,
      'Assignment imported from Canvas',
      canvas_data.course_id,
      new CustomDate(canvas_data.plannable_date),
      canvas_data.plannable_id.toString(),
      new URL(CANVAS_BASE_URL + canvas_data.html_url),
      canvas_data.planner_override !== null &&
        canvas_data.planner_override.marked_complete
        ? 'completed'
        : mapSubmissionToStatus(canvas_data.submissions),
      true,
    );
    console.log(canvas_data.planner_override);
    this.canvas_data = canvas_data;
  }

  public getCanvasData() {
    return this.canvas_data;
  }
}

export type TaskAction = 'delete' | 'edit' | 'complete-imported';
