import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { pool } from "./db";
import { SessionUser } from "@/types";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "candidate",
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

/**
 * Get the current active session in Server Components and Server Actions
 */
export async function getSession() {
  const headersList = await headers();
  return await auth.api.getSession({
    headers: headersList,
  });
}

/**
 * Get normalized session user
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: ((session.user as Record<string, unknown>).role as "candidate" | "recruiter") || "candidate",
      image: session.user.image,
    };
  } catch (err) {
    console.error("Error retrieving user session:", err);
    return null;
  }
}

/**
 * Assert user is authenticated and is a candidate
 */
export async function requireCandidate(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to continue");
  }
  if (user.role !== "candidate") {
    throw new Error("Forbidden: Candidate access required");
  }
  return user;
}

/**
 * Assert user is authenticated and is a recruiter
 */
export async function requireRecruiter(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to continue");
  }
  if (user.role !== "recruiter") {
    throw new Error("Forbidden: Recruiter access required");
  }
  return user;
}
