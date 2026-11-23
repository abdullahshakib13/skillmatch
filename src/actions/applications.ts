"use server";

import { revalidatePath } from "next/cache";
import { requireCandidate, requireRecruiter } from "@/lib/auth";
import {
  getCandidateProfileWithSkills,
  getOrCreateCandidateProfile,
} from "@/lib/db/queries/candidates";
import { getJobById } from "@/lib/db/queries/jobs";
import {
  createApplication,
  hasCandidateApplied,
  updateApplicationStatus,
} from "@/lib/db/queries/applications";
import { calculateSkillMatch } from "@/lib/utils/matching";
import { ServerActionResponse } from "@/types";

export async function applyToJobAction(
  jobId: number,
  coverNote?: string
): Promise<ServerActionResponse> {
  try {
    const candidateUser = await requireCandidate();

    const profileWithSkills = await getCandidateProfileWithSkills(candidateUser.id);
    if (!profileWithSkills) {
      return {
        success: false,
        error: "Candidate profile not found.",
      };
    }

    // Check if already applied
    const alreadyApplied = await hasCandidateApplied(jobId, profileWithSkills.id);
    if (alreadyApplied) {
      return {
        success: false,
        error: "You have already applied for this job.",
      };
    }

    // Fetch job with required skills to calculate match score snapshot
    const job = await getJobById(jobId);
    if (!job) {
      return {
        success: false,
        error: "Job post does not exist.",
      };
    }

    if (job.status !== "open") {
      return {
        success: false,
        error: "This job post is closed for applications.",
      };
    }

    const { matchPercentage } = calculateSkillMatch(
      job.skills,
      profileWithSkills.skills
    );

    await createApplication(
      job.id,
      profileWithSkills.id,
      matchPercentage,
      coverNote?.trim()
    );

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/dashboard");
    revalidatePath(`/recruiter/jobs/${jobId}/applicants`);

    return {
      success: true,
      message: `Application submitted successfully with a ${matchPercentage}% skill match!`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to apply to job";
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateApplicantStatusAction(
  applicationId: number,
  newStatus: "shortlisted" | "rejected" | "applied"
): Promise<ServerActionResponse> {
  try {
    const recruiter = await requireRecruiter();

    const success = await updateApplicationStatus(
      applicationId,
      recruiter.id,
      newStatus
    );

    if (!success) {
      return {
        success: false,
        error: "Applicant not found or unauthorized.",
      };
    }

    revalidatePath("/recruiter/jobs");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Applicant marked as ${newStatus}.`,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update applicant status";
    return {
      success: false,
      error: message,
    };
  }
}
