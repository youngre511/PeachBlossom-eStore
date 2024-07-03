export interface ApiResponse<T> {
    message: string;
    payload: T;
}
export type FetchCategoriesResponse = ApiResponse<Category[]>;
export interface Category {
    name: string;
    subCategories: string[];
}

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}
