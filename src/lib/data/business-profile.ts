import "server-only";

import { prisma } from "@/lib/prisma";

export async function getBusinessProfile() {
  const profile = await prisma.businessProfile.findFirst();
  if (!profile) {
    throw new Error(
      "Perfil do negócio não configurado — rode o seed (prisma/seed.ts).",
    );
  }
  return profile;
}
