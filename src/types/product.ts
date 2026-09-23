import type { LocalizedText } from "./i18n";

export interface KeyActive {
  name: string;
  percentage?: string;
  description: LocalizedText;
}

export interface IngredientStat {
  label: LocalizedText;
  value: string;
}

export interface ProductReview {
  author: string;
  rating: number;
  text: LocalizedText;
}

export interface Product {
  slug: string;
  collection: string;
  routineStep?: number;
  price: number;
  originalPrice?: number;
  krwReferencePrice?: number;
  images: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  soldCount?: number;
  stockCount?: number;
  badges?: string[];
  name: LocalizedText;
  subtitle?: LocalizedText;
  shortDescription: LocalizedText;
  description?: LocalizedText;
  philosophyQuote?: LocalizedText;
  keyActives?: KeyActive[];
  ingredientStats?: IngredientStat[];
  fullIngredientList?: string[];
  usageSteps?: LocalizedText[];
  reviews?: ProductReview[];
}

export interface Bundle {
  id: string;
  collection: string;
  name: LocalizedText;
  description: LocalizedText;
  bundlePrice: number;
}
