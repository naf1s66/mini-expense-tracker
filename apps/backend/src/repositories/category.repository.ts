import { prisma } from "../prisma/client.js";

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type CategoryLookupItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
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

export async function findCategoryById(
  id: string
): Promise<CategoryLookupItem | null> {
  return prisma.category.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      sortOrder: true
    }
  });
}

export async function findCategoriesByIds(
  ids: string[]
): Promise<CategoryLookupItem[]> {
  if (ids.length === 0) {
    return [];
  }

  return prisma.category.findMany({
    where: {
      id: {
        in: ids
      }
    },
    orderBy: {
      sortOrder: "asc"
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      sortOrder: true
    }
  });
}
