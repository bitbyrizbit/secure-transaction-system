import { PrismaClient, RoleName, TransactionType, TransactionStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing dependent data
  // Due to Cascade deletes on users and organizations, deleting them covers most things.
  // We'll delete organizations and roles first to reset.
  await prisma.auditLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('Cleared existing data.');

  // 2. Create roles
  const roles = await Promise.all([
    prisma.role.create({ data: { name: RoleName.ADMIN } }),
    prisma.role.create({ data: { name: RoleName.MEMBER } }),
    prisma.role.create({ data: { name: RoleName.GUEST } }),
  ]);
  console.log('Created roles:', roles.map(r => r.name).join(', '));

  // 3. Create organizations (approx 3)
  const orgs = [];
  for (let i = 0; i < 3; i++) {
    const org = await prisma.organization.create({
      data: {
        name: faker.company.name() + ' ' + faker.string.uuid().substring(0, 5),
      }
    });
    orgs.push(org);
  }
  console.log(`Created ${orgs.length} organizations.`);

  // 4. Create users (15 total, 5 per org)
  const users = [];
  for (const org of orgs) {
    for (let i = 0; i < 5; i++) {
      const user = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email() + i + faker.string.uuid().substring(0, 5),
          organizationId: org.id,
          roleId: faker.helpers.arrayElement(roles).id,
        }
      });
      users.push(user);
    }
  }
  console.log(`Created ${users.length} users.`);

  // 5. Create transactions (30-50)
  const txCount = faker.number.int({ min: 30, max: 50 });
  const transactions = [];
  for (let i = 0; i < txCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const tx = await prisma.transaction.create({
      data: {
        amount: faker.finance.amount({ min: 10, max: 1000 }),
        type: faker.helpers.arrayElement(Object.values(TransactionType)),
        status: faker.helpers.arrayElement(Object.values(TransactionStatus)),
        description: faker.finance.transactionDescription(),
        organizationId: user.organizationId,
        userId: user.id,
      }
    });
    transactions.push(tx);
  }
  console.log(`Created ${transactions.length} transactions.`);

  // 6. Create audit logs (50+)
  const logCount = faker.number.int({ min: 50, max: 100 });
  for (let i = 0; i < logCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const tx = faker.helpers.arrayElement(transactions);
    await prisma.auditLog.create({
      data: {
        action: faker.hacker.verb(),
        entity: faker.helpers.arrayElement(['User', 'Transaction', 'Organization']),
        entityId: faker.string.uuid(),
        metadata: { ip: faker.internet.ip(), browser: faker.internet.userAgent() },
        organizationId: user.organizationId,
        userId: user.id,
        transactionId: Math.random() > 0.5 ? tx.id : null,
      }
    });
  }
  console.log(`Created ${logCount} audit logs.`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
