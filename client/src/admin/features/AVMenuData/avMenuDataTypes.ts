import { ApiResponse } from "../../../common/types/commonTypes";

export interface AVCategory {
    name: string;
    subCategories: string[];
}

export interface AVMenuDataState {
    categories: AVCategory[];
    searchOptions: string[];
    loading: boolean;
    error: string | null;
}

export type AVCategoryFetchResponse = ApiResponse<AVCategory[]>;

export type AVSearchOptionFetchResponse = ApiResponse<string[]>;
