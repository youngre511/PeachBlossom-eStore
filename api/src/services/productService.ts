import Product, { ProductItem } from "../models/mongo/productModel.js";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import Category, {
    CategoryItem,
    SubcategoryItem,
} from "../models/mongo/categoryModel.js";
import Tag, { TagItem } from "../models/mongo/tagModel.js";
import { sqlCategory } from "../models/mysql/sqlCategoryModel.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";
import generateProductNo from "../utils/generateProductNo.js";
import sequelize from "../models/mysql/index.js";
import { uploadFile, deleteFile } from "./s3Service.js";
import mongoose, { ClientSession, Types, Schema } from "mongoose";
import {
    CreateProduct,
    UpdateProduct,
} from "../controllers/productController.js";
import { sqlSubcategory } from "../models/mysql/sqlSubcategoryModel.js";
import { BooleString } from "../../types/api_resp.js";
import { Op } from "sequelize";
import { JoinReqProduct } from "./cartService.js";
import { Model } from "sequelize-typescript";
import { Order } from "sequelize";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlOrderItem } from "../models/mysql/sqlOrderItemModel.js";

////// TYPES AND INTERFACES //////
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

interface FilterObject {
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

interface AdminCatalogResponse {
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

interface CatalogResponse {
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

interface JoinReqCategory extends Model {
    category_id: number;
    categoryName: string;
}

interface JoinReqSubcategory extends Model {
    subcategory_id: number;
    subcategoryName: string;
    category_id: number;
}

interface AdminProduct extends JoinReqProduct {
    Subcategory: JoinReqSubcategory;
    Category: JoinReqCategory;
}

interface JoinReqSQLProduct {
    count: number;
    rows: AdminProduct[];
}

///////////////////////////////
////// SERVICE FUNCTIONS //////
///////////////////////////////

export const extractSqlProductData = (productData: JoinReqSQLProduct) => {
    const products = productData.rows.map((product) => {
        const parsedProduct = product.get();
        if (parsedProduct.Category) {
            parsedProduct.Category = parsedProduct.Category.get();
        }
        if (parsedProduct.Subcategory) {
            parsedProduct.Subcategory = parsedProduct.Subcategory.get();
        }
        if (parsedProduct.Inventory) {
            parsedProduct.Inventory = parsedProduct.Inventory.get();
        }
        return parsedProduct;
    });
    return products;
};

export const getSearchOptions = async () => {
    const products = await Product.find({}).select("name -_id");
    const results: string[] = [];

    products.forEach((product) => {
        results.push(product.name);
    });
    return results;
};

////// GET SORTED AND FILTERED PRODUCTS //////

export const getProducts = async (filters: FilterObject) => {
    if (!filters.page) {
        filters.page = "1";
    }
    if (!filters.sort) {
        filters.sort = "name-ascend";
    }
    const skip = (+filters.page - 1) * +filters.itemsPerPage;
    let categoryId: Schema.Types.ObjectId | undefined;
    let subcategoryId: Types.ObjectId | undefined;

    // Retrieve category and tag object ids if names are provided
    if (filters.category) {
        const cat = await Category.findOne({ name: filters.category }).exec();
        if (cat) {
            categoryId = cat._id;
            if (filters.subcategory) {
                const subcat = cat.subcategories.filter(
                    (subcategory: SubcategoryItem) =>
                        subcategory.name === filters.subcategory
                );
                if (subcat.length === 0) {
                    throw new Error(
                        `Not a valid subcategory of ${filters.category}`
                    );
                } else {
                    subcategoryId = subcat[0]._id;
                }
            }
        } else {
            throw new Error("Not a valid category");
        }
    }
    let tagIds: Array<Schema.Types.ObjectId> | undefined;
    if (filters.tags) {
        const ts = await Tag.find({ name: { $in: filters.tags } });
        if (ts) {
            tagIds = ts.map((t: TagItem) => t._id);
        }
    }

    //Begin Query Chain
    let query = Product.find();
    query = query.where({ status: "active" });

    // Narrow by user-input search params
    if (filters.search) {
        const searchRegex = new RegExp(filters.search, "i");
        const productNoRegex = new RegExp(`^${filters.search}$`, "i");
        query = query.or([
            { name: { $regex: searchRegex } },
            { productNo: { $regex: productNoRegex } },
        ]);
    }

    // Narrow by category
    if (subcategoryId) {
        query = query.where({ subcategory: subcategoryId });
    } else if (categoryId) {
        query = query.where({ category: categoryId });
    }

    // Narrow by tag
    if (tagIds) {
        query = query.where({ tag: { $in: tagIds } });
    }

    // Narrow by color
    if (filters.color) {
        query = query.where({ "attributes.color": { $in: filters.color } });
    }

    // Narrow by material
    if (filters.material) {
        query = query.where({
            "attributes.material": { $elemMatch: { $in: filters.material } },
        });
    }

    // Define and iterate through all min-max parameters and add query params asneeded
    const minMaxParams = ["price", "width", "height", "depth"];
    for (const param of minMaxParams) {
        const minParam = `min${
            param.charAt(0).toUpperCase() + param.slice(1)
        }` as keyof FilterObject;
        const maxParam = `max${
            param.charAt(0).toUpperCase() + param.slice(1)
        }` as keyof FilterObject;

        if (filters[minParam]) {
            query = query
                .where(param)
                .gte(filters[minParam] as unknown as number);
        }
        if (filters[maxParam]) {
            query = query
                .where(param)
                .lte(filters[maxParam] as unknown as number);
        }
    }

    const validSortMethods = [
        "price-ascend",
        "price-descend",
        "name-ascend",
        "name-descend",
    ];

    // Add sort parameters
    if (validSortMethods.includes(filters.sort)) {
        const sortParams = filters.sort.split("-");
        const sortOrder = sortParams[1] === "ascend" ? 1 : -1;
        query = query.sort({ [sortParams[0]]: sortOrder });
    }
    console.log("sort", query.getOptions().sort);
    //Get number of total results
    const totalCount = await Product.countDocuments(query.getQuery());

    // Get results with number limited and page of results specified
    const products: Array<ProductItem> = await query
        .skip(skip)
        .limit(parseInt(filters.itemsPerPage))
        .exec();
    // Find active promotions and calculate discount price if necessary
    const productRecords: Array<CatalogResponse> = products.map((product) => {
        let discountPrice: number | null = null;
        const activePromos = product.promotions.filter((promotion) => {
            const now = new Date(Date.now());
            const startDate = new Date(promotion.startDate);
            const endDate = new Date(promotion.endDate);
            return (
                promotion.active === true && startDate < now && endDate > now
            );
        });

        // If there is an active promotion, grab the description and determine whether it is a single-product sale.
        let promoDesc: string | null = null;
        let singleSale: boolean = false;
        if (activePromos.length > 0) {
            const activePromo = activePromos[0];
            promoDesc = activePromo.description;
            if (promoDesc === "single product") {
                singleSale = true;
            }
            if (activePromo.discountType === "percentage") {
                discountPrice =
                    product.price - product.price * activePromo.discountValue;
            } else {
                discountPrice = product.price - activePromo.discountValue;
            }
        }

        // Formulate response
        const catObj: CatalogResponse = {
            productNo: product.productNo,
            name: product.name,
            description: product.description,
            price: product.price,
            discountPrice: discountPrice,
            promotionDesc: promoDesc,
            singleProdProm: singleSale,
            attributes: {
                color: product.attributes.color,
                material: product.attributes.material,
                weight: product.attributes.weight,
                dimensions: {
                    width: product.attributes.dimensions.width,
                    height: product.attributes.dimensions.height,
                    depth: product.attributes.dimensions.depth,
                },
            },
            images: product.images,
            stock: product.stock,
        };
        return catObj;
    });
    console.log("productRecords:", productRecords);
    return { totalCount, productRecords };
};

////// GET SORTED AND FILTERED ADMIN PRODUCTS ///////

export const getAdminProducts = async (filters: AdminFilterObj) => {
    if (!filters.sort) {
        filters.sort = "name-ascend";
    }

    const page = +filters.page || 1;
    const offset = (page - 1) * +filters.itemsPerPage;

    const whereClause: any = {};
    if (filters.search) {
        whereClause[Op.or] = [
            { productName: { [Op.like]: `%${filters.search}%` } },
            { productNo: { [Op.like]: `%${filters.search}%` } },
        ];
    }

    if (filters.view === "discontinued" || filters.view === "active") {
        whereClause[Op.and] = { status: filters.view };
    }

    const validSortMethods = [
        "price-ascend",
        "price-descend",
        "name-ascend",
        "name-descend",
        "lastModified-ascend",
        "lastModified-descend",
        "createdAt-ascend",
        "createdAt-descend",
    ];

    let sortBy: string;
    let sortOrder: string;
    if (validSortMethods.includes(filters.sort)) {
        const splitSort = filters.sort.split("-");
        sortOrder = splitSort[1].split("en")[0].toUpperCase();
        // Substitute updatedAt for lastModified and productName for name
        sortBy =
            splitSort[0] === "lastModified"
                ? "updatedAt"
                : splitSort[0] === "name"
                ? "productName"
                : splitSort[0];
    } else {
        (sortOrder = "ASC"), (sortBy = "name");
    }

    const orderArray: Order = [[sortBy, sortOrder]];
    if (sortBy !== "productName") {
        orderArray.push(["productName", "ASC"]);
    }

    const products = (await sqlProduct.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: sqlCategory,
                as: "Category",
                where: filters.category
                    ? { categoryName: filters.category }
                    : undefined,
            },
            {
                model: sqlSubcategory,
                as: "Subcategory",
                where: filters.subcategory
                    ? { subcategoryName: filters.subcategory }
                    : undefined,
            },
            {
                model: sqlInventory,
                as: "Inventory",
            },
        ],
        order: orderArray,
        limit: +filters.itemsPerPage,
        offset: offset,
        nest: true,
    })) as unknown as JoinReqSQLProduct;

    const totalCount = products.count;
    const parsedProducts = extractSqlProductData(products);

    //Format Data
    const productRecords: Array<AdminCatalogResponse> = parsedProducts.map(
        (product) => {
            const catObj = {
                thumbnailUrl: product.thumbnailUrl,
                name: product.productName,
                productNo: product.productNo,
                price: product.price,
                category: product.Category.categoryName,
                subcategory: product.Subcategory?.subcategoryName || null,
                lastModified: product.updatedAt.toLocaleString(),
                createdAt: product.createdAt.toLocaleString(),
                description: product.description,
                stock: product.Inventory.stock,
                reserved: product.Inventory.reserved,
                available: product.Inventory.available,
                status: product.status,
            };
            return catObj;
        }
    );

    return { totalCount, productRecords };
};

//////////////////////////////////////////////////////////////////////////

export const getOneProduct = async (productNo: string) => {
    try {
        const result: ProductItem | null = await Product.findOne({
            productNo: productNo,
        });

        if (!result) {
            throw new Error("Product not found");
        }

        const category: CategoryItem | null = await Category.findOne({
            _id: result.category,
        });

        if (!category) {
            throw new Error("Product category not found");
        }

        const subcategory: SubcategoryItem | null =
            category.subcategories.filter(
                (subcategory) =>
                    String(subcategory._id) === String(result.subcategory)
            )[0];

        const productData = {
            name: result.name,
            productNo: result.productNo,
            category: category.name,
            subcategory: subcategory ? subcategory.name : null,
            description: result.description,
            attributes: result.attributes,
            price: result.price,
            images: result.images,
            tags: result.tags || null,
        };
        return productData;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error fetching product: " + error.message);
        } else {
            throw new Error("An unknown error occurred while fetching product");
        }
    }
};

//////////////////////////////////////////////////////////////////////////

export const getCatalogProductDetails = async (productNo: string) => {
    try {
        const result: ProductItem | null = await Product.findOne({
            productNo: productNo,
        });

        if (!result) {
            throw new Error("Product not found");
        }

        const category: CategoryItem | null = await Category.findOne({
            _id: result.category,
        });

        if (!category) {
            throw new Error("Product category not found");
        }

        const subcategory: SubcategoryItem | null =
            category.subcategories.filter(
                (subcategory) =>
                    String(subcategory._id) === String(result.subcategory)
            )[0];

        // Find active promotions and calculate discount price if necessary
        let discountPrice: number | null = null;
        const activePromos = result.promotions.filter((promotion) => {
            const now = new Date(Date.now());
            const startDate = new Date(promotion.startDate);
            const endDate = new Date(promotion.endDate);
            return (
                promotion.active === true && startDate < now && endDate > now
            );
        });

        // If there is an active promotion, grab the description and determine whether it is a single-product sale.
        let promoDesc: string | null = null;
        let singleSale: boolean = false;
        if (activePromos.length > 0) {
            const activePromo = activePromos[0];
            promoDesc = activePromo.description;
            if (promoDesc === "single product") {
                singleSale = true;
            }
            if (activePromo.discountType === "percentage") {
                discountPrice =
                    result.price - result.price * activePromo.discountValue;
            } else {
                discountPrice = result.price - activePromo.discountValue;
            }
        }

        const productData = {
            name: result.name,
            productNo: result.productNo,
            category: category.name,
            subcategory: subcategory ? subcategory.name : null,
            description: result.description,
            attributes: result.attributes,
            price: result.price,
            discountPrice: discountPrice,
            promoDesc: promoDesc,
            singleProdProm: singleSale,
            images: result.images,
            stock: result.stock,
            tags: result.tags || null,
        };

        return productData;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error fetching product: " + error.message);
        } else {
            throw new Error("An unknown error occurred while fetching product");
        }
    }
};

//////////////////////////////////////////////////////////////////////////

export const createProduct = async (
    productData: CreateProduct
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();

    try {
        const {
            name,
            category,
            subcategory = null,
            prefix,
            description,
            attributes,
            price,
            stock = 0,
            images = [],
            tags = null,
        } = productData;
        const productNo = await generateProductNo(prefix);

        // Upload images to S3 and get URLs
        const sizes = [140, 300, 450, 600, 960, 1024];
        const imageUrls = await Promise.all(
            images.map(async (image) => {
                const { fileContent, fileName, mimeType } = image;
                const fileType = await fileTypeFromBuffer(fileContent);
                let extension: string;
                let fileMimeType: string = mimeType;
                if (fileType) {
                    const { ext, mime } = fileType;
                    extension = `.${ext}`;
                    fileMimeType = mime;
                } else {
                    extension = "";
                }
                try {
                    for (const size of sizes) {
                        let processedImageBuffer;
                        const metadata = await sharp(fileContent).metadata();
                        if (
                            fileMimeType !== "image/webp" &&
                            metadata.width !== size
                        ) {
                            processedImageBuffer = await sharp(fileContent)
                                .resize({ width: size })
                                .toFormat("webp")
                                .toBuffer();
                        } else if (
                            fileMimeType !== "image/webp" &&
                            metadata.width === size
                        ) {
                            processedImageBuffer = await sharp(fileContent)
                                .toFormat("webp")
                                .toBuffer();
                        } else if (
                            fileMimeType === "image/webp" &&
                            metadata.width !== size
                        ) {
                            processedImageBuffer = await sharp(fileContent)
                                .resize({ width: size })
                                .toBuffer();
                        } else {
                            processedImageBuffer = fileContent;
                        }
                        const specificFileName = `${fileName}_${size}${extension}`;
                        await uploadFile(
                            processedImageBuffer,
                            specificFileName,
                            "image/webp"
                        );
                    }
                    return `${process.env.CLOUDFRONT_DOMAIN}/${fileName}`; // Base URL of the uploaded image
                } catch (error) {
                    console.error(`Error processing image: ${error}`);
                }
            })
        );

        //Construct SQL product
        const abbrDesc = description.substring(0, 79) + "...";
        const sqlCatRec = await sqlCategory.findOne({
            where: { categoryName: category },
            transaction: sqlTransaction,
            raw: true,
        });
        if (!sqlCatRec) {
            throw new Error("category does not exist in SQL database");
        }
        const sqlCategoryId: number = sqlCatRec.category_id;

        let sqlSubcategoryId: number | null;
        if (subcategory) {
            const subcatRec = await sqlSubcategory.findOne({
                where: { subcategoryName: subcategory },
                transaction: sqlTransaction,
                raw: true,
            });
            if (!subcatRec) {
                throw new Error("subcategory does not exist in SQL database");
            }

            if (subcatRec.category_id !== sqlCategoryId) {
                throw new Error(
                    `${subcategory} is not a subcategory of ${category}`
                );
            }
            sqlSubcategoryId = subcatRec.subcategory_id;
        } else {
            sqlSubcategoryId = null;
        }

        const thumbnailUrl = imageUrls[0] ? imageUrls[0] : null;
        const newSQLProduct = {
            productNo: productNo,
            productName: name,
            price: price,
            status: "active",
            description: abbrDesc,
            category_id: sqlCategoryId,
            subcategory_id: sqlSubcategoryId,
            thumbnailUrl: thumbnailUrl,
        };

        const createdProduct = await sqlProduct.create(newSQLProduct, {
            transaction: sqlTransaction,
        });

        const createdProductId = createdProduct.get().id;

        // create SQL inventory record
        await sqlInventory.create(
            {
                product_id: createdProductId,
                stock: stock,
                reserved: 0,
            },
            { transaction: sqlTransaction }
        );

        // MongoDB operations
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            throw new Error("category does not exist in MongoDB database");
        }
        const categoryId: Schema.Types.ObjectId = categoryDoc._id;

        let subcategoryId: Types.ObjectId | null;
        if (subcategory) {
            const filteredSubcat = categoryDoc.subcategories.filter(
                (subcat: { name: string; _id: Types.ObjectId }) =>
                    subcat.name === subcategory
            );
            if (filteredSubcat.length === 0) {
                throw new Error(
                    `${subcategory} is not a subcategory of ${category}`
                );
            }
            subcategoryId = filteredSubcat[0]._id;
        } else {
            subcategoryId = null;
        }

        let validTagIds: Array<Schema.Types.ObjectId> | null;

        if (tags) {
            const tagIds = await Promise.all(
                tags.map(
                    async (tagName): Promise<Schema.Types.ObjectId | null> => {
                        const tagDoc = await Tag.findOne({ name: tagName });
                        return tagDoc ? tagDoc._id : null;
                    }
                )
            );

            validTagIds = tagIds.filter(
                (id): id is Schema.Types.ObjectId => id != null
            );
        } else {
            validTagIds = null;
        }

        await Product.create(
            [
                {
                    productNo: productNo,
                    name: name,
                    category: categoryId,
                    subcategory: subcategoryId,
                    description: description,
                    attributes: attributes,
                    price: price,
                    promotions: [],
                    stock: stock,
                    images: imageUrls,
                    tags: validTagIds,
                },
            ],
            { session: session }
        );

        await session.commitTransaction();
        await sqlTransaction.commit();

        return {
            success: true,
            message: `Product successfully added to databases`,
        };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error adding product: " + error.message);
        } else {
            throw new Error("An unknown error occurred while adding product");
        }
    } finally {
        await session.endSession();
    }
};

//////////////////////////////////////////////////////////////////////////

export const updateProductDetails = async (
    productData: UpdateProduct
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();

    try {
        const {
            name,
            productNo,
            category,
            subcategory,
            description,
            attributes,
            price,
            existingImageUrls,
            images = [],
            tags = null,
        } = productData;
        console.log("received subcategory:", subcategory);

        // Delete unused images from S3
        const targetProduct = await Product.findOne({
            productNo: productNo,
        });

        if (!targetProduct) {
            throw new Error("Product not found in mongo database");
        }

        const imagesToDelete = targetProduct.images.filter(
            (imageUrl) => !existingImageUrls.includes(imageUrl)
        );

        if (imagesToDelete.length > 0) {
            imagesToDelete.forEach(async (imageUrl) => {
                const splitUrl = imageUrl.split("/");
                const fileName = splitUrl[splitUrl.length - 1];
                console.log("DELETING", fileName);
                await deleteFile(fileName);
            });
        }

        // Upload images to S3 and get URLs

        let newImageUrls: string[] | null = null;

        if (images.length > 0) {
            const sizes = [140, 300, 450, 600, 960, 1024];
            newImageUrls = await Promise.all(
                images.map(async (image) => {
                    const { fileContent, fileName, mimeType } = image;
                    const fileType = await fileTypeFromBuffer(fileContent);
                    let extension: string;
                    let fileMimeType: string = mimeType;
                    if (fileType) {
                        const { ext, mime } = fileType;
                        extension = `.${ext}`;
                        fileMimeType = mime;
                    } else {
                        extension = "";
                    }
                    try {
                        for (const size of sizes) {
                            let processedImageBuffer;
                            const metadata = await sharp(
                                fileContent
                            ).metadata();
                            if (
                                fileMimeType !== "image/webp" &&
                                metadata.width !== size
                            ) {
                                processedImageBuffer = await sharp(fileContent)
                                    .resize({ width: size })
                                    .toFormat("webp")
                                    .toBuffer();
                            } else if (
                                fileMimeType !== "image/webp" &&
                                metadata.width === size
                            ) {
                                processedImageBuffer = await sharp(fileContent)
                                    .toFormat("webp")
                                    .toBuffer();
                            } else if (
                                fileMimeType === "image/webp" &&
                                metadata.width !== size
                            ) {
                                processedImageBuffer = await sharp(fileContent)
                                    .resize({ width: size })
                                    .toBuffer();
                            } else {
                                processedImageBuffer = fileContent;
                            }
                            const specificFileName = `${fileName}_${size}${extension}`;
                            await uploadFile(
                                processedImageBuffer,
                                specificFileName,
                                "image/webp"
                            );
                        }
                        return `${process.env.CLOUDFRONT_DOMAIN}/${fileName}`; // Base URL of the uploaded image
                    } catch (error) {
                        console.error(`Error processing image: ${error}`);
                        return "";
                    }
                })
            );
        }

        let imageUrls: string[];

        if (
            existingImageUrls.length > 0 &&
            existingImageUrls[0] &&
            newImageUrls
        ) {
            imageUrls = existingImageUrls.concat(newImageUrls);
        } else if (
            (existingImageUrls.length === 0 || !existingImageUrls[0]) &&
            newImageUrls
        ) {
            imageUrls = newImageUrls;
        } else if (existingImageUrls.length > 0 && existingImageUrls[0]) {
            imageUrls = existingImageUrls;
        } else {
            imageUrls = [];
        }

        /////////////////////////////////////////////////
        //Construct update parameters for Mongo and SQL//
        /////////////////////////////////////////////////

        const updateFields: any = {};
        const sqlUpdateFields: any = {};

        //name
        if (name) {
            updateFields.name = name;
            sqlUpdateFields.productName = name;
        }

        let foundCategory;
        let foundSqlCategory;
        //category
        if (category) {
            foundCategory = await Category.findOne({ name: category });
            if (!foundCategory) {
                throw new Error("Category not found in Mongo.");
            }
            updateFields.category = foundCategory._id;

            foundSqlCategory = await sqlCategory.findOne({
                where: { categoryName: category },
            });
            if (!foundSqlCategory) {
                throw new Error("Category not found in SQL");
            }
            sqlUpdateFields.category_id = foundSqlCategory.category_id;
        } else {
            foundCategory = await Category.findOne({
                _id: targetProduct.category,
            });
            if (!foundCategory) {
                throw new Error("Category not found in Mongo.");
            }
            foundSqlCategory = await sqlCategory.findOne({
                where: { categoryName: foundCategory.name },
            });

            if (!foundSqlCategory) {
                throw new Error("Category not found in SQL");
            }
        }
        // subcategories
        if (subcategory) {
            console.log("adding subcategory");
            const foundSubcategory = foundCategory.subcategories.filter(
                (subcat) => subcat.name === subcategory
            )[0];
            if (!foundSubcategory) {
                throw new Error("Subcategory not found in Mongo");
            }
            updateFields.subcategory = foundSubcategory._id;

            const foundSqlSubcategory = await sqlSubcategory.findOne({
                where: {
                    subcategoryName: subcategory,
                    category_id: foundSqlCategory.dataValues.category_id,
                },
            });

            if (!foundSqlSubcategory) {
                throw new Error("Subcategory not found in SQL");
            }
            sqlUpdateFields.subcategory_id =
                foundSqlSubcategory.dataValues.subcategory_id;
        }

        //price
        if (price) {
            updateFields.price = price;
            sqlUpdateFields.price = price;
        }

        //description
        if (description) {
            updateFields.description = description;
            sqlUpdateFields.description = description.substring(0, 79) + "...";
        }

        //attributes (mongo only)
        if (attributes) {
            updateFields.attributes = attributes;
        }

        //images
        updateFields.images = imageUrls;
        const thumbnailUrl = imageUrls[0] ? imageUrls[0] : null;
        sqlUpdateFields.thumbnailUrl = thumbnailUrl;

        //tags
        if (tags) {
            updateFields.tags = tags;
        }

        console.log("mongo update fields:", updateFields);
        //UPDATE MONGO
        await Product.findByIdAndUpdate(
            targetProduct._id,
            { $set: updateFields },
            { new: true, session: session }
        ).exec();
        console.log("sql update fields:", sqlUpdateFields);
        //UPDATE SQL
        await sqlProduct.update(sqlUpdateFields, {
            where: { productNo: productNo },
            transaction: sqlTransaction,
        });

        await session.commitTransaction();
        await sqlTransaction.commit();

        return {
            success: true,
            message: `Product successfully updated`,
        };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error updating product details: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while updating product details"
            );
        }
    } finally {
        await session.endSession();
    }
};

export const updateProductStatus = async (
    productNos: string[],
    newStatus: "active" | "discontinued"
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();

    try {
        const mongoResults = await Product.updateMany(
            { productNo: productNos },
            { status: newStatus },
            { session: session }
        ).exec();

        //UPDATE SQL
        const [affectedSQLRows] = await sqlProduct.update(
            { status: newStatus },
            {
                where: { productNo: { [Op.in]: productNos } },
                transaction: sqlTransaction,
            }
        );

        if (newStatus === "discontinued") {
            await sqlCartItem.destroy({
                where: { productNo: { [Op.in]: productNos } },
                transaction: sqlTransaction,
            });
        }

        if (mongoResults.modifiedCount === 0 || affectedSQLRows === 0) {
            if (mongoResults.matchedCount === 0) {
                throw new Error("Products not found");
            }
            throw new Error(
                "Unable to update products, either because all products already had the new status or because of an unknown error"
            );
        }

        await session.commitTransaction();
        await sqlTransaction.commit();

        return {
            success: true,
            message: `Product statuses successfully updated`,
        };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error(
                "Error updating product status(es): " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while updating product status(es)"
            );
        }
    } finally {
        await session.endSession();
    }
};

//delete single product ONLY if no order items reference product sqlProduct record

export const deleteProduct = async (
    productNo: string
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();
    try {
        // First check whether any order items exist for product and prevent deletion if so
        const orderItems = await sqlOrderItem.findAll({
            where: { productNo: productNo },
        });
        if (orderItems.length > 0) {
            throw new Error(
                "Unable to delete products referenced by existing order item records"
            );
        }
        // Store image urls
        const mongoRecord: ProductItem | null = await Product.findOne({
            productNo: productNo,
        });
        if (!mongoRecord) {
            throw new Error("Mongo record not found");
        }

        const imagesToDelete = [...mongoRecord.images];

        //Delete Mongo Record
        await Product.deleteOne({ productNo: productNo }, { session: session });

        //Delete SQL Records
        const sqlProdRec = await sqlProduct.findOne({
            where: { productNo: productNo },
        });
        if (!sqlProdRec) {
            throw new Error("SQL record not found");
        }
        const product_id = sqlProdRec.id;

        await sqlInventory.destroy({
            where: { product_id: product_id },
            transaction: sqlTransaction,
        });
        await sqlProduct.destroy({
            where: { productNo: productNo },
            transaction: sqlTransaction,
        });
        await sqlCartItem.destroy({
            where: { productNo: productNo },
            transaction: sqlTransaction,
        });

        //Delete Images
        if (imagesToDelete.length > 0) {
            imagesToDelete.forEach(async (imageUrl) => {
                const splitUrl = imageUrl.split("/");
                const fileName = splitUrl[splitUrl.length - 1];
                console.log("DELETING", fileName);
                await deleteFile(fileName);
            });
        }

        await session.commitTransaction();
        await sqlTransaction.commit();

        return { success: true, message: "product successfully deleted" };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error(
                "Error updating product status(es): " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while updating product status(es)"
            );
        }
    } finally {
        await session.endSession();
    }
};
