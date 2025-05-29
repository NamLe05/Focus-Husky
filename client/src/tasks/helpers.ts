import {CanvasSubmission, TaskState, TaskStatus} from './model';

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

export function dateToHtmlInputString(date: Date) {
  const dateCopy = new Date(date);
  dateCopy.setMinutes(dateCopy.getMinutes() - dateCopy.getTimezoneOffset());
  return dateCopy.toISOString().slice(0, 16);
}

export function htmlInputStringToDate(str: string) {
  return new Date(str);
}

export function getTodayMidnight() {
  const dueToday = new Date();
  dueToday.setHours(23);
  dueToday.setMinutes(59);
  dueToday.setSeconds(0);
  dueToday.setMilliseconds(0);
  return dueToday;
}
