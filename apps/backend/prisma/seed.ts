import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedCategories = [
  { name: "Food", slug: "food", sortOrder: 1 },
  { name: "Transport", slug: "transport", sortOrder: 2 },
  { name: "Housing", slug: "housing", sortOrder: 3 },
  { name: "Utilities", slug: "utilities", sortOrder: 4 },
  { name: "Health", slug: "health", sortOrder: 5 },
  { name: "Entertainment", slug: "entertainment", sortOrder: 6 },
  { name: "Shopping", slug: "shopping", sortOrder: 7 },
  { name: "Education", slug: "education", sortOrder: 8 },
  { name: "Travel", slug: "travel", sortOrder: 9 },
  { name: "Other", slug: "other", sortOrder: 10 }
] as const;

async function main() {
  const activeSlugs = seedCategories.map((category) => category.slug);

  await prisma.$transaction(async (tx) => {
    for (const category of seedCategories) {
      await tx.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          sortOrder: category.sortOrder,
          isActive: true
        },
        create: {
          name: category.name,
          slug: category.slug,
          sortOrder: category.sortOrder,
          isActive: true
        }
      });
    }

    await tx.category.updateMany({
      where: {
        slug: { notIn: activeSlugs },
        isActive: true
      },
      data: {
        isActive: false
      }
    });
  });

  console.log(`Seeded ${seedCategories.length} active categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

