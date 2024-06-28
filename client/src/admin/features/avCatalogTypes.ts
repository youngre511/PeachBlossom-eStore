export type AVColor =
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

export type AVMaterial =
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

export interface AVProduct {
    productNo: string;
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    promotionDesc: string | null;
    singleProductProm: boolean;
    attributes: {
        color: AVColor;
        material: AVMaterial[];
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

export interface AVFilters {
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
    sortMethod: string;
    page: string;
    itemsPerPage: string;
}

export interface AVCatalogState {
    products: AVProduct[];
    numberOfResults: number;
    filters: AVFilters;
    loading: boolean;
    error: string | null;
}

export interface AVFetchProductsResponse {
    filters: AVFilters;
    products: AVProduct[];
    numberOfResults: number;
}
