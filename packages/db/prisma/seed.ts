import {
  PrismaClient,
  LedgerAccountType,
  MetalType,
  PaymentMode,
  TransactionType,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.ledgerEntry.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.karigarJobItem.deleteMany();
  await prisma.karigarJob.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.item.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.karigar.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.ledgerAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

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

  const karigars = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.karigar.create({
        data: {
          tenantId: tenant.id,
          name: `Karigar ${i + 1}`,
          phone: `98900000${(i + 1).toString().padStart(2, "0")}`,
          skill: i % 2 === 0 ? "Gold Work" : "Repair"
        }
      })
    )
  );

  const customers = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.customer.create({
        data: {
          tenantId: tenant.id,
          name: `Customer ${i + 1}`,
          phone: `90000000${(i + 1).toString().padStart(2, "0")}`,
          notes: i % 3 === 0 ? "Frequent buyer" : null
        }
      })
    )
  );

  const items = await Promise.all(
    Array.from({ length: 50 }).map((_, i) =>
      prisma.item.create({
        data: {
          tenantId: tenant.id,
          itemCode: `ITM-${(i + 1).toString().padStart(4, "0")}`,
          category: i % 2 === 0 ? "RING" : "CHAIN",
          metal: i % 3 === 0 ? MetalType.SILVER : MetalType.GOLD,
          grossWt: Number((8 + i * 0.12).toFixed(3)),
          netWt: Number((7.5 + i * 0.1).toFixed(3)),
          purity: i % 3 === 0 ? 92.5 : 91.6,
          makingCharges: Number((300 + i * 5).toFixed(2)),
          status: "IN_STOCK"
        }
      })
    )
  );

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

  const [cashAccount] = await prisma.ledgerAccount.findMany({
    where: { tenantId: tenant.id, name: "Cash" },
    take: 1
  });
  const [salesAccount] = await prisma.ledgerAccount.findMany({
    where: { tenantId: tenant.id, name: "Sales" },
    take: 1
  });

  if (!cashAccount || !salesAccount) {
    throw new Error("Required ledger accounts are missing");
  }

  for (let i = 0; i < 10; i++) {
    const item = items[i];
    const customer = customers[i % customers.length];
    const total = Number((item.netWt.toNumber() * 6200 + item.makingCharges.toNumber()).toFixed(2));
    const txn = await prisma.transaction.create({
      data: {
        tenantId: tenant.id,
        type: TransactionType.SALE,
        partyType: "CUSTOMER",
        partyId: customer.id,
        totalAmount: total,
        paymentMode: PaymentMode.UPI
      }
    });

    await prisma.transactionItem.create({
      data: {
        transactionId: txn.id,
        itemId: item.id,
        grossWt: item.grossWt,
        purity: item.purity,
        rate: 6200,
        makingCharges: item.makingCharges,
        amount: total
      }
    });

    await prisma.ledgerEntry.createMany({
      data: [
        {
          tenantId: tenant.id,
          accountId: cashAccount.id,
          debit: total,
          credit: 0,
          transactionId: txn.id
        },
        {
          tenantId: tenant.id,
          accountId: salesAccount.id,
          debit: 0,
          credit: total,
          transactionId: txn.id
        }
      ]
    });
  }

  await prisma.karigarJob.createMany({
    data: karigars.map((karigar, i) => ({
      tenantId: tenant.id,
      karigarId: karigar.id,
      metal: i % 2 === 0 ? MetalType.GOLD : MetalType.SILVER,
      issuedWt: Number((12 + i).toFixed(3)),
      issuedPurity: i % 2 === 0 ? 91.6 : 92.5,
      wastageAgreed: 1.5
    }))
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
