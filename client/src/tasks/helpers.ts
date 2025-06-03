import {CanvasSubmission, TaskStatus} from './model';

export class CustomDate extends Date {
  public invalid: boolean;
  public date: string | Date;

  constructor(date?: string | Date) {
    super(date);
    this.invalid = this.dateToHtmlInputString() === 'invalid';
  }

  public dateToHtmlInputString() {
    try {
      const dateCopy = new Date(this);
      dateCopy.setMinutes(dateCopy.getMinutes() - dateCopy.getTimezoneOffset());
      return dateCopy.toISOString().slice(0, 16);
    } catch (e) {
      return 'invalid';
    }
  }
}

export function mapSubmissionToStatus(
  submissions: false | CanvasSubmission,
): TaskStatus {
  if (submissions === false) {
    return 'not started';
  }
  if (submissions.graded) {
    return 'evaluated';
  }
  if (submissions.submitted) {
    return 'submitted';
  }
  return 'not started';
}

export function isTodo(status: TaskStatus) {
  return status === 'not started' || status === 'in progress';
}

export function isComplete(status: TaskStatus) {
  return (
    status === 'submitted' || status === 'completed' || status === 'evaluated'
  );
}

export function htmlInputStringToDate(str: string) {
  return new CustomDate(str);
}

export function getTodayMidnight() {
  const dueToday = new CustomDate(new Date());
  dueToday.setHours(23);
  dueToday.setMinutes(59);
  dueToday.setSeconds(0);
  dueToday.setMilliseconds(0);
  return dueToday;
}
