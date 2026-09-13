import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- Users ---");
  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true, name: true, email: true, organizationId: true, roleId: true }
  });
  console.table(users);

  console.log("\n--- Organizations ---");
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true }
  });
  console.table(orgs);

  console.log("\n--- Roles ---");
  const roles = await prisma.role.findMany({
    select: { id: true, name: true }
  });
  console.table(roles);

  console.log("\n--- Transactions ---");
  const transactions = await prisma.transaction.findMany({
    take: 10,
    select: { id: true, type: true, amount: true, status: true, userId: true, organizationId: true }
  });
  console.table(transactions);

  console.log("\n--- Audit Logs ---");
  const auditLogs = await prisma.auditLog.findMany({
    take: 10,
    select: { id: true, action: true, entity: true, userId: true, organizationId: true }
  });
  console.table(auditLogs);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
