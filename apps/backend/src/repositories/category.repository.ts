import { prisma } from "../prisma/client.js";

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export async function findActiveCategories(): Promise<CategoryListItem[]> {
  return prisma.category.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      sortOrder: "asc"
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true
    }
  });
}
