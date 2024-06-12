export interface ApiResponse<T> {
    message: string;
    payload: T;
}

export interface Category {
    name: string;
    subCategories: string[];
}

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

export type FetchCategoriesResponse = ApiResponse<Category[]>;
