import { ApiResponse } from "../../../common/types/commonTypes";

export type FetchCategoriesResponse = ApiResponse<Category[]>;
export interface Category {
    categoryName: string;
    productCount: number;
    SubCategory: { subCategoryName: string; productCount: number }[];
}

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}
