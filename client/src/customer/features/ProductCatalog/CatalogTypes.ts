export type Color =
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink"
    | "gold"
    | "silver"
    | "white"
    | "gray"
    | "black"
    | "brown"
    | "cream"
    | "beige"
    | "multicolor"
    | "clear";

export type Material =
    | "glass"
    | "plastic"
    | "ceramic"
    | "metal"
    | "wood"
    | "fabric"
    | "leather"
    | "stone"
    | "rubber"
    | "resin"
    | "natural fiber"
    | "bamboo";

export interface Product {
    productNo: string;
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    promotionDesc: string | null;
    singleProductProm: boolean;
    attributes: {
        color: Color;
        material: Material[];
        // Dimensions in inches
        weight: number;
        dimensions: {
            width: number;
            height: number;
            depth: number;
        };
    };
    images: string[];
    stock: number;
}

export interface Filters {
    search: string | null;
    category: string | null;
    subCategory: string | null;
    color: string[] | null;
    minPrice: string | null;
    maxPrice: string | null;
    minWidth: string | null;
    maxWidth: string | null;
    minHeight: string | null;
    maxHeight: string | null;
    minDepth: string | null;
    maxDepth: string | null;
    tags: string[] | null;
    material: string[] | null;
    sort: string;
    page: string;
}

export interface CatalogState {
    singleProduct: Product | null;
    products: Product[];
    numberOfResults: number;
    filters: Filters;
    loading: boolean;
    error: string | null;
}

export interface FetchProductsResponse {
    filters: Filters;
    products: Product[];
    numberOfResults: number;
}
