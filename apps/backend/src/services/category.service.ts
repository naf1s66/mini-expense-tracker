import { findActiveCategories } from "../repositories/category.repository.js";

export async function listActiveCategories() {
  return findActiveCategories();
}
