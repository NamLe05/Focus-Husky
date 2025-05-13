import {CanvasSubmission, TaskStatus} from './model';

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
