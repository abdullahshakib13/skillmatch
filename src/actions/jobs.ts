"use server";

import { revalidatePath } from "next/cache";
import { requireRecruiter } from "@/lib/auth";
import { createJob, updateJobStatus } from "@/lib/db/queries/jobs";
import { ServerActionResponse } from "@/types";

export interface CreateJobInput {
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range?: string;
  description: string;
  skill_ids: number[];
}

export async function createJobAction(
  input: CreateJobInput
): Promise<ServerActionResponse<{ jobId: number }>> {
  try {
    const recruiter = await requireRecruiter();

    if (!input.title || !input.company_name || !input.location || !input.description) {
      return {
        success: false,
        error: "Please fill in all required job fields.",
      };
    }

    if (!input.skill_ids || input.skill_ids.length === 0) {
      return {
        success: false,
        error: "Please select at least one required skill for the job.",
      };
    }

    const job = await createJob(
      recruiter.id,
      {
        title: input.title.trim(),
        company_name: input.company_name.trim(),
        location: input.location.trim(),
        job_type: input.job_type.trim(),
        salary_range: input.salary_range?.trim(),
        description: input.description.trim(),
      },
      input.skill_ids
    );

    revalidatePath("/recruiter/jobs");
    revalidatePath("/jobs");

    return {
      success: true,
      message: "Job posted successfully!",
      data: { jobId: job.id },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to post job";
    return {
      success: false,
      error: message,
    };
  }
}

export async function toggleJobStatusAction(
  jobId: number,
  newStatus: "open" | "closed"
): Promise<ServerActionResponse> {
  try {
    const recruiter = await requireRecruiter();

    const updated = await updateJobStatus(jobId, recruiter.id, newStatus);
    if (!updated) {
      return {
        success: false,
        error: "Job not found or unauthorized.",
      };
    }

    revalidatePath("/recruiter/jobs");
    revalidatePath(`/recruiter/jobs/${jobId}/applicants`);
    revalidatePath("/jobs");

    return {
      success: true,
      message: `Job status changed to ${newStatus}.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update job status";
    return {
      success: false,
      error: message,
    };
  }
}
