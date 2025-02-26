import { Request, Response } from "express";
import { AdminFilterObj, Color, Material } from "../services/_serviceTypes.js";
import { Attributes, Promotion } from "../models/mongo/productModel.js";
import { RecentlyViewedItem } from "../models/mysql/sqlCustomerModel.js";

/////////////////////////////////////////////////////////////////
////////////////////////////SUPPORT//////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * @description Supporting Types and Interfaces
 */

//////////////////ACTIVITY//////////////////

export interface SearchLog {
    activityType: "search";
    timestamp: string;
    searchTerm: string;
}
export interface ProductInteractionLog {
    activityType: "productView" | "cartAdd" | "purchase";
    timestamp: string;
    productNo: string;
}

//////////////////ANALYTICS//////////////////

export type BaseGranularity = "week" | "month" | "quarter";
export const baseGranularityArr = ["week", "month", "quarter"];

export type GranularityPlus = BaseGranularity | "year";
export const granularityPlusArr = ["week", "month", "quarter", "year"];

export type GranularityExtended = GranularityPlus | "all";
export const granularityExtendedArr = [
    "week",
    "month",
    "quarter",
    "year",
    "all",
];

export type ChartType = "bar" | "line" | "pie";
export const chartTypeArr = ["bar", "line", "pie"];

export interface OverTimeParams {
    granularity: BaseGranularity;
    byState: boolean;
    byRegion: boolean;
    startDate: string;
    endDate: string;
    chartType: ChartType;
}

export interface OverTimePlusParams
    extends Omit<OverTimeParams, "granularity"> {
    granularity: GranularityPlus;
}

export interface OverTimeExtendedParams
    extends Omit<OverTimeParams, "granularity"> {
    granularity: GranularityExtended;
}

//////////////////AUTH//////////////////

//////////////////CART//////////////////

interface CartItemResponse {
    productNo: string;
    name: string;
    price: number;
    discountPrice: number;
    quantity: number;
    thumbnailUrl: string;
    productUrl: string;
}

interface CartResponsePayload {
    items: CartItemResponse[];
    subTotal: number;
    cartId: number;
    numberOfItems: number;
}

//////////////////CATEGORY//////////////////

//////////////////INVENTORY//////////////////

//////////////////ORDER//////////////////

export interface ShippingDetails {
    shippingAddress: string;
    shippingAddress2: string;
    firstName: string;
    lastName: string;
    zipCode: string;
    phoneNumber: string;
    stateAbbr: string;
    city: string;
}
export interface OrderData {
    cartId: number | null;
    customerId?: number;
    shipping: ShippingDetails;
    email: string;
    orderDetails: {
        subTotal: number;
        shipping: number;
        tax: number;
        totalAmount: number;
        items: Array<{
            productNo: string;
            quantity: number;
            priceAtCheckout: number;
        }>;
    };
}

export interface GetOrdersFilters {
    sort: string;
    orderStatus?: string[];
    search?: string;
    state?: string[];
    customerId?: number;
    startDate?: string;
    endDate?: string;
    page: string;
    itemsPerPage: string;
}

export interface UpdateItem {
    order_item_id: number;
    quantity: number;
    fulfillmentStatus: string;
}

export interface UpdateOrder {
    orderNo: string;
    subTotal: number;
    shipping: number;
    tax: number;
    totalAmount: number;
    shippingAddress: string;
    stateAbbr: string;
    city: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
    orderStatus: string;
    items: UpdateItem[];
}
//////////////////PRODUCT//////////////////

export interface CreateProduct {
    name: string;
    category: string;
    subcategory?: string;
    prefix: string;
    description: string;
    attributes: Attributes;
    price: number;
    stock?: number;
    tags?: Array<string>;
}

export interface UpdateProduct
    extends Partial<Omit<CreateProduct, "prefix" | "stock">> {
    existingImageUrls: string[];
    productNo: string;
}

interface ProductFilters {
    [key: string]: string | string[] | undefined;
    category?: string;
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

interface AdminProductFilters {
    [key: string]: string | string[] | undefined;
    category?: string;
    subcategory?: string;
    tags?: string;
    page: string;
    sort: string;
    itemsPerPage: string;
    view: string;
    search?: string;
}

interface UpdateProductDetailsInfo {
    name?: string;
    productNo: string;
    category?: string;
    subcategory?: string;
    description?: string;
    attributes?: string;
    price?: number;
    existingImageUrls: string;
    tags?: Array<string>;
}

//////////////////PROMOTION//////////////////

export type CreatePromo = {
    name: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: string;
    endDate: string;
    active: boolean;
};

export type UpdatePromo = Partial<Promotion>;

export interface PromoParamsRequestParams {
    promoNum: string;
}

export interface AddToPromoRequestParams {
    promoId: string;
}

export interface CategoriesAndProductsBody {
    categories?: string[];
    products?: string[];
}

export interface UpdatePromoRequestParams {
    promoId: string;
}

export interface UpdatePromoRequestBody {
    updatedData: UpdatePromo;
}

export interface RemovePromoRequestParams {
    promoId: string;
}

//////////////////USER//////////////////

/////////////////////////////////////////////////////////////////
//////////////////////////REQ and RES////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * @description Req/Res Types and Interfaces
 */

//////////////////ACTIVITY//////////////////

export interface LogRequest extends Request {
    body: {
        logs: Array<SearchLog | ProductInteractionLog>;
    };
}

export interface CookieRequest extends Request {
    body: {
        allowAll: boolean;
    };
}

//////////////////ANALYTICS//////////////////

export interface OverTimeRequest extends Request {
    query: {
        granularity: string;
        byState?: string;
        byRegion?: string;
        startDate?: string;
        endDate?: string;
        chartType: string;
    };
}

export interface ByCategoryRequest extends Request {
    query: {
        granularity: string;
        stateAbbr?: string;
        region?: string;
        bySubcategory?: string;
        startDate?: string;
        endDate?: string;
        returnPercentage?: string;
        chartType: string;
    };
}

export interface ByCategoryParams {
    granularity: GranularityExtended;
    stateAbbr: string;
    region: string;
    bySubcategory: boolean;
    startDate: string;
    endDate: string;
    returnPercentage: boolean;
    chartType: ChartType;
}

export interface TopProductsRequest {
    query: {
        period: string;
        number: string;
        worstPerforming?: string;
    };
}

//////////////////AUTH//////////////////

export interface CreateAccountRequest extends Request {
    body: {
        username: string;
        password: string;
        role: "customer" | "admin";
        accessLevel?: "full" | "limited";
        email?: string;
        defaultPassword?: boolean;
        firstName?: string;
        lastName?: string;
    };
}

export interface LoginRequest extends Request {
    body: {
        username: string;
        password: string;
        cartId?: string;
    };
}

//////////////////CART//////////////////

export interface CartIdRequestParams extends Request {
    cartId: string;
}

export interface AddItemRequest extends Request {
    body: {
        productNo: string;
        cartId: number | null;
        quantity: number;
        thumbnailUrl: string;
    };
}

export interface UpdateQuantityRequest extends Request {
    body: {
        productNo: string;
        cartId: number;
        quantity: number;
    };
}

export interface DeleteItemRequest extends Request {
    body: {
        productNo: string;
        cartId: number;
    };
}

export interface CartResponse extends Response {
    message: string;
    payload: CartResponsePayload;
}

//////////////////CATEGORY//////////////////

export interface CategoryParamsIdRequest extends Request {
    params: {
        id: string;
    };
}

export interface CategoryParamsNameRequest extends Request {
    params: {
        name: string;
    };
}

export interface SubcategoryParamsNameRequest extends Request {
    params: {
        subcategoryName: string;
    };
}

export interface CategoryCreateRequest extends Request {
    body: {
        name: string;
    };
}

export interface SubcategoryCreateRequest extends Request {
    params: {
        categoryName: string;
    };
    body: {
        subcategoryName: string;
    };
}
export interface CategoryUpdateRequest extends Request {
    body: {
        oldName: string;
        newName: string;
    };
}

//////////////////INVENTORY//////////////////

export interface CartIdRequest extends Request {
    body: {
        cartId: number;
    };
}

export interface AdjustHoldQuantityRequest extends Request {
    body: {
        cartId: number;
        adjustment: number;
        productNo: string;
    };
}

export interface StockUpdateRequest extends Request {
    body: {
        updateData: Record<string, number>;
        filters: AdminFilterObj;
    };
}

//////////////////ORDER//////////////////

export interface PlaceOrderRequest extends Request {
    body: {
        orderData: OrderData;
        save?: boolean;
    };
}

export interface PlaceOrderResponse extends Response {
    success: boolean;
    message: string;
    orderNo: string;
}

export interface GetOneOrderRequest extends Request {
    params: {
        orderNo: string;
    };
    query: {
        email?: string;
    };
}

export interface GetOrdersRequest extends Request {
    query: {
        sort: string;
        orderStatus?: string[];
        search?: string;
        state?: string[];
        startDate?: string;
        endDate?: string;
        page: string;
        itemsPerPage: string;
    };
}

export interface UpdateOrderRequest extends Request {
    body: UpdateOrder;
}

///////////////////PRODUCT//////////////////

export interface UpdateProductStatusRequest extends Request {
    body: {
        productNos: string[];
        newStatus: "active" | "discontinued";
    };
}

export interface SearchOptions extends Response {
    searchOptions: Array<{
        display: string;
        value: string;
        id: number;
        url: string;
    }>;
}

export interface CreateProductRequest extends Request {
    body: CreateProduct;
    images?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
}

export interface ProductParamsRequest extends Request {
    params: {
        productNo: string;
    };
}

export interface ProductGetRequest extends Request {
    query: ProductFilters;
}

export interface AdminProductGetRequest extends Request {
    query: AdminProductFilters;
}

export interface PromoParamsRequest extends Request {
    params: {
        promoNum: string;
    };
}

export interface UpdateProductDetailsRequest extends Request {
    body: UpdateProductDetailsInfo;
    images?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
}

//////////////////PROMOTION//////////////////

export interface CreatePromoRequest extends Request {
    body: {
        promotion: CreatePromo;
        categories?: string[];
        products?: string[];
    };
}

export interface AddToPromoRequest
    extends Request<AddToPromoRequestParams, any, CategoriesAndProductsBody> {}

export interface UpdatePromoRequest
    extends Request<UpdatePromoRequestParams, any, UpdatePromoRequestBody> {}

export interface RemovePromoRequest
    extends Request<RemovePromoRequestParams, any, CategoriesAndProductsBody> {}

//////////////////USER//////////////////

export interface ChangeLevelRequest extends Request {
    body: {
        username: string;
        newAccessLevel: "full" | "limited" | "view only";
    };
}

export interface ResetPasswordRequest extends Request {
    body: {
        user_id: number;
    };
}

export interface ChangePasswordRequest extends Request {
    body: {
        oldPassword: string;
        newPassword: string;
    };
}

export interface ChangeUsernameRequest extends Request {
    body: {
        newUsername: string;
        password: string;
    };
}

export interface ChangeDisplayNameRequest extends Request {
    body: {
        newFirstName: string;
        newLastName: string;
        password: string;
    };
}

export interface UserIdParamsRequest extends Request {
    params: {
        userId: string;
    };
}

export interface GetRequest extends Request {
    query: {
        page: string;
        usersPerPage: string;
        accessLevel?: string;
        searchString?: string;
    };
}

export interface AddCustomerAddressRequest extends Request {
    body: {
        address: ShippingDetails;
        nickname: string | null;
    };
}

export interface EditCustomerAddressRequest extends Request {
    body: {
        address: ShippingDetails;
        nickname: string | null;
        addressId: number;
    };
}

export interface RemoveCustomerAddressRequest extends Request {
    body: {
        addressId: number;
    };
}

export interface CloseAccountRequest extends Request {
    body: {
        password: string;
    };
}

export interface SyncReviewedRequest extends Request {
    body: {
        recentlyViewed: Array<RecentlyViewedItem>;
    };
}
