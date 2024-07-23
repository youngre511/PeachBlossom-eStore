import { ApiResponse } from "../../../common/types/commonTypes";

export interface AVCategory {
    categoryName: string;
    productCount: number;
    SubCategory: { subCategoryName: string; productCount: number }[];
}

export interface AVMenuDataState {
    categories: AVCategory[];
    searchOptions: string[];
    loading: boolean;
    error: string | null;
}

export type AVCategoryFetchResponse = ApiResponse<AVCategory[]>;

export type AVSearchOptionFetchResponse = ApiResponse<string[]>;
