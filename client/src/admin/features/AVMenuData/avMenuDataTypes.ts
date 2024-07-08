import { ApiResponse } from "../../../common/types/commonTypes";

export interface AVCategory {
    categoryName: string;
    subCategories: string[];
}

export interface AVMenuDataState {
    categories: AVCategory[];
    searchOptions: string[];
    loading: boolean;
    error: string | null;
}

export interface SearchOptionObject {
    display: string;
    value: string;
    item: number;
    url: string;
}
export type AVCategoryFetchResponse = ApiResponse<AVCategory[]>;

export type AVSearchOptionFetchResponse = ApiResponse<SearchOptionObject[]>;
