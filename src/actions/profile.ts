"use server";

import { revalidatePath } from "next/cache";
import { requireCandidate } from "@/lib/auth";
import {
  getOrCreateCandidateProfile,
  updateCandidateProfile,
  updateCandidateSkills,
} from "@/lib/db/queries/candidates";
import { ServerActionResponse } from "@/types";

export interface UpdateProfileInput {
  headline: string;
  bio: string;
  experience_years: number;
  resume_link?: string;
  skill_ids: number[];
}

export async function updateCandidateProfileAndSkillsAction(
  input: UpdateProfileInput
): Promise<ServerActionResponse> {
  try {
    const user = await requireCandidate();

    const profile = await getOrCreateCandidateProfile(user.id);

    await updateCandidateProfile(user.id, {
      headline: input.headline.trim(),
      bio: input.bio.trim(),
      experience_years: Number(input.experience_years) || 0,
      resume_link: input.resume_link?.trim(),
    });

    await updateCandidateSkills(profile.id, input.skill_ids || []);

    revalidatePath("/profile");
    revalidatePath("/jobs");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile and skills updated successfully!",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return {
      success: false,
      error: message,
    };
  }
}
