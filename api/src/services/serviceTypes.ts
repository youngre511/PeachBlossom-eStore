import { Model } from "sequelize-typescript";
import { ProductItem } from "../models/mongo/productModel.js";

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

// FILTER INTERFACES

export interface FilterObject {
    search?: string;
    category?: string;
    subcategory?: string;
    tags?: string;
    page: string;
    color?: Color[];
    material?: Material[];
    minPrice?: string;
    maxPrice?: string;
    minWidth?: string;
    maxWidth?: string;
    minHeight?: string;
    maxHeight?: string;
    minDepth?: string;
    maxDepth?: string;
    sort: string;
    itemsPerPage: string;
}

export interface AdminFilterObj {
    search?: string;
    category?: string;
    subcategory?: string;
    tags?: string;
    page: string;
    sort: string;
    view: string;
    itemsPerPage: string;
}

// BASE INTERFACES

export interface BaseInventory extends Model {
    inventory_id: number;
    product_id: number;
    stock: number;
    reserved: number;
    available: number;
}

export interface BaseCategory extends Model {
    category_id: number;
    categoryName: string;
}

export interface BaseSubcategory extends Model {
    subcategory_id: number;
    subcategoryName: string;
    category_id: number;
}

export interface BaseOrder extends Model {
    order_id: number;
    customer_id: number | null;
    orderNo: string;
    orderDate: Date;
    subTotal: number;
    shipping: number;
    tax: number;
    totalAmount: number;
    email: string;
    orderStatus: string;
    address_id: number;
}

export interface BaseOrderItem extends Model {
    order_item_id: number;
    order_id: number;
    productNo: string;
    quantity: number;
    priceWhenOrdered: number;
    fulfillmentStatus: string;
}

export interface BaseCartItem extends Model {
    cart_item_id: number;
    cart_id: number;
    productNo: string;
    thumbnailUrl?: string;
    promotionId?: string;
    quantity: number;
    finalPrice: number;
    reserved: boolean;
}

export interface BaseCart extends Model {
    cart_id: number;
    customer_id: number | null;
}

export interface BaseProductRaw {
    id: number;
    productNo: string;
    productName: string;
    price: number;
    description: string;
    category_id: number;
    subcategory_id: number | null;
    thumbnailUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
}

export interface BaseProduct extends Model {
    id: number;
    productNo: string;
    productName: string;
    price: number;
    description: string;
    category_id: number;
    subcategory_id: number | null;
    thumbnailUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
}

// JOIN INTERFACES - Types for find queries with table joins

// Product table query with included Inventory table
export interface JoinReqProduct extends BaseProduct {
    Inventory: BaseInventory;
}

// Flattened product table query with included Inventory table data
export interface RawJoinReqProduct extends BaseProductRaw {
    "Inventory.inventory_id": number;
    "Inventory.product_id": number;
    "Inventory.stock": number;
    "Inventory.reserved": number;
    "Inventory.available": number;
}

// Inventory table query with included Product table
export interface JoinReqInventory extends BaseInventory {
    Product: BaseProduct;
}

// "Product > Inventory" query with included Subcategory and Category tables
export interface JoinReqAdminProduct extends JoinReqProduct {
    Subcategory: BaseSubcategory;
    Category: BaseCategory;
}

// CartItem table query with included "Product > Inventory"
export interface JoinReqCartItem extends BaseCartItem {
    Product: JoinReqProduct;
}

// Cart query with included "CartItem > Product > Inventory"
export interface JoinReqCart extends BaseCart {
    CartItem: JoinReqCartItem[];
}

// Find and count query for AdminProducts
export interface JoinReqCountAdminProduct {
    count: number;
    rows: JoinReqAdminProduct[];
}

// "Product" query with included Category, Subcategory, and "OrderItem > Order" but raw: true
export interface JoinReqTopProductRaw extends BaseProduct {
    "OrderItem.totalQuantity": number;
    "Category.categoryName": string;
    "Subcategory.subcategoryName": string | null;
}

// Responses

export interface AdminCatalogResponse {
    thumbnailUrl: string | null;
    name: string;
    productNo: string;
    price: number;
    category: string;
    subcategory: string;
    lastModified: string;
    createdAt: string;
    description: string;
    stock: number;
    reserved: number;
    available: number;
    status: string;
}

export interface CatalogResponse {
    productNo: string;
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    promotionDesc: string | null;
    singleProdProm: boolean;
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

export interface TopProductResponse {
    thumbnailUrl: string | null;
    name: string;
    productNo: string;
    price: number;
    category: string;
    subcategory: string | null;
    description: string;
    totalQuantity: number;
}

// Aggregate Interface
export interface AggregateProduct extends ProductItem {
    stockZero: 0 | 1;
}
