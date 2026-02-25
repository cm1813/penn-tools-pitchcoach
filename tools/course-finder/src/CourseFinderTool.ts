// ─────────────────────────────────────────────────────────────────────────────
// CourseFinderTool
//
// Demonstrates the canonical tool pattern:
//   1. Extend Tool<Input, Output>.
//   2. Declare manifest inline (or import from manifest.ts).
//   3. Use only injected ToolContext — no direct imports of env/db/fetch.
//   4. Return { assistantMessage, artifacts?, telemetry? }.
//
// This implementation is intentionally stubby: it generates a canned LLM
// response.  Replace the TODO sections with real Penn course API calls.
// ─────────────────────────────────────────────────────────────────────────────

import { Tool } from "@penntools/core/tools";
import type { ToolManifest } from "@penntools/core/tools";
import type { ToolContext } from "@penntools/core/tools";
import type { CourseFinderInput, CourseFinderOutput, CourseResult } from "./types.js";

// Stub data — replace with a real API call to Penn Course Review / Path@Penn.
const STUB_COURSES: CourseResult[] = [
  {
    courseId: "CIS-5450",
    title: "Big Data Analytics",
    description: "Covers scalable data processing with Spark, Kafka, and ML pipelines.",
    instructor: "Staff",
    semester: "2025C",
    credits: 1,
    url: "https://courses.upenn.edu/cis-5450",
  },
  {
    courseId: "CIS-4190",
    title: "Applied Machine Learning",
    description: "Hands-on introduction to ML with Python and scikit-learn.",
    instructor: "Staff",
    semester: "2025A",
    credits: 1,
    url: "https://courses.upenn.edu/cis-4190",
  },
];

export class CourseFinderTool extends Tool<CourseFinderInput, CourseFinderOutput> {
  readonly manifest: ToolManifest = {
    id: "course-finder",
    title: "Course Finder",
    description: "Search UPenn courses by topic, instructor, or semester.",
    image: "/tools/course-finder/icon.png",
    contributors: ["penntools-team"],
  };

  async execute(
    input: CourseFinderInput,
    context: ToolContext
  ): Promise<CourseFinderOutput> {
    const { query, limit = 5 } = input;

    context.logger.info("course-finder.execute", { query, limit });
    context.analytics.track(context.userId, "tool_course_finder_run", { query });

    // TODO: Replace with a real Penn course search API call.
    // Use context.llm.complete() for semantic ranking if needed.
    // Use context.db.toolData.upsert() to cache results per user.

    const systemPrompt =
      "You are a Penn course advisor. Given a search query, summarise which courses best match and why.";

    const llmResponse = await context.llm.complete({
      systemPrompt,
      messages: [
        {
          role: "user",
          content: `Find Penn courses matching: "${query}". Here are the available courses: ${JSON.stringify(STUB_COURSES)}`,
        },
      ],
    });

    const courses = STUB_COURSES.slice(0, limit);

    return {
      assistantMessage: llmResponse.content,
      artifacts: [
        {
          kind: "json",
          label: "Course results",
          data: courses,
        },
      ],
      telemetry: {
        durationMs: 0, // ToolRunner will overwrite this
        tokensUsed: llmResponse.usage.totalTokens,
        meta: { query, resultCount: courses.length },
      },
    };
  }
}
