import { Category } from './categories.dtos';
import { Locales, Visibility } from '../enums/enums.enum';
import { SimpleUser } from './user.dtos';

export interface WorldcupListQuery {
  page?: number;
  perPage?: number;
  search?: string | null;
  categories: string[];
  locale?: Locales[];
  sortBy?: string;
  includeNsfw?: boolean;
}

export interface Worldcup {
  id: number;
  title: string;
  description: string;
  visibility: Visibility;
  coverImage?: string;
  slug?: string;
  locale: Locales;
  isNsfw: boolean;
  categoryId: number;
  category?: Category;
  user?: SimpleUser;
  selectionsCount?: number;
  plays: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MyWorldcupListQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface WorldcupsListResponse {
  page: number;
  perPage: number;
  total: number;
  worldcups: Worldcup[];
}
