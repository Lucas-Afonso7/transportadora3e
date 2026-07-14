import "dotenv/config";
import { randomBytes } from "crypto";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";

async function seedAdmin() {
  const username = process.env.ADMIN_SEED_USERNAME ?? "evaldo";
  const existing = await prisma.admin.findUnique({ where: { username } });

  if (existing) {
    console.log(`Admin "${username}" já existe — nada a fazer.`);
    return;
  }

  const password = process.env.ADMIN_SEED_PASSWORD ?? randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(password);

  await prisma.admin.create({
    data: { username, name: "Evaldo", passwordHash },
  });

  console.log("Admin criado:");
  console.log(`  usuário: ${username}`);
  console.log(`  senha:   ${password}`);
  if (!process.env.ADMIN_SEED_PASSWORD) {
    console.log(
      "  (senha gerada automaticamente — anote agora, ela não será mostrada de novo)",
    );
  }
}

async function seedBusinessProfile() {
  const existing = await prisma.businessProfile.findFirst();
  if (existing) {
    console.log("Perfil do negócio já existe — nada a fazer.");
    return;
  }

  await prisma.businessProfile.create({
    data: {
      businessName: "Transporte 3E",
      pixKey: "transporte3e@empresa.com.br",
      whatsappPhone: "5531995094324",
    },
  });
  console.log("Perfil do negócio criado (editável depois pelo admin).");
}

async function main() {
  await seedAdmin();
  await seedBusinessProfile();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
