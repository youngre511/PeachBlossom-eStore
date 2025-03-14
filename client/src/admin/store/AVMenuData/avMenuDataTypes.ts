import { ApiResponse } from "../../../common/types/commonTypes";

export type Subcategory = { subcategoryName: string; productCount: number };
export interface AVCategory {
    categoryName: string;
    productCount: number;
    Subcategory: Subcategory[];
}

export interface AVMenuDataState {
    categories: AVCategory[];
    searchOptions: string[];
    loading: boolean;
    error: string | null;
}

export type AVCategoryFetchResponse = ApiResponse<AVCategory[]>;

export type AVSearchOptionFetchResponse = ApiResponse<string[]>;
