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
    price: number;
    discountPrice: number;
    promotionName: string;
    attributes: {
        color: Color;
        material: Material;
        size: "small" | "medium" | "large";
        // Dimensions in inches
        weight: number;
        dimensions: {
            width: number;
            height: number;
            depth: number;
            diameter: number;
            circumference: number;
        };
    };
    tags: string[];
    images: string[];
}

export interface Filters {
    search: string | null;
    category: string | null;
    size: string[] | null;
    color: string[] | null;
    minPrice: string | null;
    maxPrice: string | null;
    minWidth: string | null;
    maxWidth: string | null;
    minHeight: string | null;
    maxHeight: string | null;
    minDepth: string | null;
    maxDepth: string | null;
    minCircum: string | null;
    maxCircum: string | null;
    minDiam: string | null;
    maxDiam: string | null;
    tags: string[] | null;
    material: string[] | null;
    sortMethod: string;
    page: string;
}

export interface CatalogueState {
    products: Product[];
    filters: Filters | null;
    loading: boolean;
    error: string | null;
}

export interface FetchProductsResponse {
    filters: Filters;
    products: Product[];
}
