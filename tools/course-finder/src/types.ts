// ── CourseFinder input/output types ───────────────────────────────────────────

export interface CourseFinderInput {
  /** Natural language query, e.g. "intro ML courses for non-majors" */
  query: string;
  /** Optional semester filter, e.g. "2025A" */
  semester?: string;
  /** Max number of results to return. Default: 5 */
  limit?: number;
}

export interface CourseResult {
  courseId: string;
  title: string;
  description: string;
  instructor: string;
  semester: string;
  credits: number;
  /** Penn InTouch or Path@Penn link */
  url: string;
}

export interface CourseFinderOutput {
  assistantMessage: string;
  artifacts?: [
    {
      kind: "json";
      label: "Course results";
      data: CourseResult[];
    },
  ];
  telemetry?: {
    durationMs: number;
    tokensUsed?: number;
    meta?: Record<string, unknown>;
  };
}
