import {v4 as uuid} from 'uuid';

export type TaskId = string;

export type TaskStatus =
  | 'not started'
  | 'in progress'
  | 'completed'
  | 'submitted'
  | 'graded';

export class TaskModel {
  private id: TaskId;
  private title: string;
  private description: string;
  private status: TaskStatus;
  private course: string;
  private deadline: Date;
  private link?: URL;

  public constructor(
    title: string,
    description: string,
    course: string,
    deadline: Date,
    link?: URL,
  ) {
    this.id = uuid();
    this.title = title;
    this.description = description;
    this.course = course;
    this.deadline = deadline;
    this.link = link;
  }
}

export type CanvasTask = {
  id: number;
  title: string;
  description: string;
  user_id: number;
  workflow_state: string;
  course_id: number;
  todo_date: string;
  linked_object_type: string;
  linked_object_id: number;
  linked_object_html_url: string;
  linked_object_url: string;
};

export class CanvasTaskModel extends TaskModel {
  private canvas_data: CanvasTask;

  public constructor(canvas_data: CanvasTask) {
    super(
      canvas_data.title,
      canvas_data.description,
      canvas_data.course_id.toString(),
      new Date(canvas_data.todo_date),
      new URL(canvas_data.linked_object_url),
    );
    this.canvas_data = canvas_data;
  }

  public getCanvasData() {
    return this.canvas_data;
  }
}
