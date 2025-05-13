export type CourseId = number;

export type Course = {
  id: CourseId;
  name: string;
  course_code: string;
  course_format: string;
  time_zone: string;
};
