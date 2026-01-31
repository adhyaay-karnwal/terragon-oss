"use server";

import { adminOnly } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { User } from "@rover/shared";
import { getGithubPRForAdmin as getGithubPRForAdminInternal } from "@rover/shared/model/github";

export const getGithubPRForAdmin = adminOnly(async function getGithubPRForAdmin(
  adminUser: User,
  { prNumber, repoFullName }: { prNumber: number; repoFullName: string },
) {
  const pr = await getGithubPRForAdminInternal({ db, prNumber, repoFullName });
  if (!pr) {
    return undefined;
  }
  return pr;
});

export type GithubPRForAdmin = NonNullable<
  Awaited<ReturnType<typeof getGithubPRForAdmin>>
>;
