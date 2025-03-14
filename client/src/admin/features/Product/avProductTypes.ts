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
    thumbnailUrl: string;
    name: string;
    productNo: string;
    price: number;
    category: string;
    subcategory: string;
    lastModified: string;
    createdAt: string;
    description: string;
    tags?: string[];
    stock: number;
    reserved: number;
    available: number;
    status: string;
}

export interface AVFullProduct {
    productNo: string;
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory: string;
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
    subcategory: string | null;
    tags: string[] | null;
    sort: string;
    page: string;
    view: string;
    itemsPerPage: string;
}

export interface AVProductState {
    products: AVProduct[];
    numberOfResults: number;
    filters: AVFilters;
    loading: boolean;
    error: string | null;
}

export interface AVUpdateInventoryResponse {
    products: AVProduct[];
    numberOfResults: number;
}

export interface AVFetchProductsResponse extends AVUpdateInventoryResponse {
    filters: AVFilters;
}
