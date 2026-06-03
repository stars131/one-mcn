import { prisma } from "@/lib/db/prisma";

async function main() {
  const users = await prisma.user.findMany({ include: { operatingAccounts: { orderBy: { createdAt: "asc" }, take: 1 } } });
  for (const user of users) {
    const account =
      user.operatingAccounts[0] ||
      (await prisma.operatingAccount.create({
        data: {
          userId: user.id,
          name: user.name ? `${user.name}的运营账号` : "默认运营账号",
          platform: "综合"
        }
      }));

    await Promise.all([
      prisma.ipProfile.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.source.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.hotTopic.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.topic.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.content.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.publishRecord.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.contentMetric.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.analyticsSnapshot.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } }),
      prisma.reviewReport.updateMany({ where: { userId: user.id, operatingAccountId: null }, data: { operatingAccountId: account.id } })
    ]);
  }
}

main().finally(() => prisma.$disconnect());
