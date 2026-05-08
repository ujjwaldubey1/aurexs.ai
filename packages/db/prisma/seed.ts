import { PrismaClient, LedgerAccountType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "seed-tenant-core" },
    update: {},
    create: {
      id: "seed-tenant-core",
      name: "Demo Jewellery Store",
      gstin: "22AAAAA0000A1Z5",
      plan: "core"
    }
  });

  await prisma.user.upsert({
    where: { id: "seed-owner-user" },
    update: {},
    create: {
      id: "seed-owner-user",
      tenantId: tenant.id,
      name: "Owner",
      phone: "9999999999",
      role: UserRole.OWNER
    }
  });

  const accounts = [
    { name: "Cash", type: LedgerAccountType.ASSET },
    { name: "Bank", type: LedgerAccountType.ASSET },
    { name: "Sales", type: LedgerAccountType.INCOME },
    { name: "Purchase", type: LedgerAccountType.EXPENSE }
  ];

  for (const account of accounts) {
    await prisma.ledgerAccount.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: account.name } },
      update: {},
      create: { tenantId: tenant.id, ...account }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
