import Product, {
    PopulatedProductItem,
    ProductItem,
} from "../models/mongo/productModel.js";

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
    AdminProductFilters,
    CreateProduct,
    ProductFilters,
    UpdateProduct,
} from "../controllers/_controllerTypes.js";
import { sqlSubcategory } from "../models/mysql/sqlSubcategoryModel.js";
import { BooleString } from "../../types/api_resp.js";
import { Op, Transaction } from "sequelize";

import { Order } from "sequelize";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlOrderItem } from "../models/mysql/sqlOrderItemModel.js";
import {
    AdminCatalogResponse,
    AggregateProduct,
    CatalogResponse,
    JoinReqCountAdminProduct,
} from "./_serviceTypes.js";
import processImages from "../utils/processImages.js";
import { calculatePagination } from "../utils/sqlSearchHelpers.js";
import { getCustomerIdFromUsername } from "./userService.js";
import {
    RecentlyViewedItem,
    sqlCustomer,
} from "../models/mysql/sqlCustomerModel.js";

////// TYPES AND INTERFACES //////

///////////////////////////////
////// SERVICE FUNCTIONS //////
///////////////////////////////

export const extractSqlProductData = (
    productData: JoinReqCountAdminProduct
) => {
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

////// GET SORTED AND FILTERED PRODUCTS WITH OUT OF STOCK PRODUCTS LISTED LAST//////

export const getProducts = async (filters: ProductFilters) => {
    try {
        console.log("Filters:", filters);
        if (!filters.page) {
            filters.page = "1";
        }
        if (!filters.sort) {
            filters.sort = "name-ascend";
        }
        const skip = (+filters.page - 1) * +filters.itemsPerPage;
        let categoryId: Types.ObjectId | undefined;
        let subcategoryId: Types.ObjectId | undefined;

        // Retrieve category and tag object ids if names are provided
        if (filters.category) {
            const cat = await Category.findOne({
                name: filters.category,
            }).exec();
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
        let tagIds: Array<Types.ObjectId> | undefined;
        if (filters.tags) {
            const ts = await Tag.find({ name: { $in: filters.tags } });
            if (ts) {
                tagIds = ts.map((t: TagItem) => t._id);
            }
        }

        //Begin setting match conditions
        const matchConditions: { [key: string]: any } = { status: "active" };

        // Narrow by user-input search params
        if (filters.search) {
            const searchRegex = new RegExp(filters.search, "i");
            const productNoRegex = new RegExp(`^${filters.search}$`, "i");
            matchConditions.$or = [
                { name: { $regex: searchRegex } },
                { productNo: { $regex: productNoRegex } },
            ];
        }

        // Narrow by category
        if (subcategoryId) {
            matchConditions.subcategory = subcategoryId;
        } else if (categoryId) {
            matchConditions.category = categoryId;
        }

        // Narrow by tag
        if (tagIds) {
            matchConditions.tag = { $in: tagIds };
        }

        // Narrow by color
        if (filters.color) {
            matchConditions["attributes.color"] = { $in: filters.color };
        }

        // Narrow by material
        if (filters.material) {
            matchConditions["attributes.material"] = {
                $elemMatch: { $in: filters.material },
            };
        }

        // Define and iterate through all min-max parameters and add query params asneeded
        const minMaxParams = ["price", "width", "height", "depth"];
        for (const param of minMaxParams) {
            const minParam = `min${
                param.charAt(0).toUpperCase() + param.slice(1)
            }` as keyof ProductFilters;
            const maxParam = `max${
                param.charAt(0).toUpperCase() + param.slice(1)
            }` as keyof ProductFilters;
            if (filters[minParam]) {
                matchConditions[
                    `${
                        param === "price" ? "" : "attributes.dimensions."
                    }${param}`
                ] = {
                    ...matchConditions[
                        `${
                            param === "price" ? "" : "attributes.dimensions."
                        }${param}`
                    ],
                    $gte: Number(filters[minParam]),
                };
            }
            if (filters[maxParam]) {
                matchConditions[
                    `${
                        param === "price" ? "" : "attributes.dimensions."
                    }${param}`
                ] = {
                    ...matchConditions[
                        `${
                            param === "price" ? "" : "attributes.dimensions."
                        }${param}`
                    ],
                    $lte: Number(filters[maxParam]),
                };
            }
        }

        const validSortMethods = [
            "price-ascend",
            "price-descend",
            "name-ascend",
            "name-descend",
        ];
        // Add sort parameters
        let sortFields: Record<string, 1 | -1> = {};
        if (validSortMethods.includes(filters.sort)) {
            const sortParams = filters.sort.split("-");
            const sortOrder: 1 | -1 = sortParams[1] === "ascend" ? 1 : -1;
            sortFields[sortParams[0]] = sortOrder;
        }

        const sortStage: Record<string, 1 | -1> = {
            stockZero: 1,
            ...sortFields,
        };

        console.log("MatchConditions:", matchConditions);

        const aggregationPipeline = [
            { $match: matchConditions },
            // Add a field to indicate if stock is zero (1) or greater than zero (0)
            {
                $addFields: {
                    stockZero: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
                },
            },
            // Sort by stockZero first, then by your sortFields
            { $sort: sortStage },
            // Use $facet to get total count and paginated data
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: +filters.itemsPerPage }],
                },
            },
        ];

        const pipelineResult = await Product.aggregate(
            aggregationPipeline
        ).exec();

        // //Get number of total results
        const totalCount =
            pipelineResult[0].metadata.length > 0
                ? pipelineResult[0].metadata[0].total
                : 0;
        const products: Array<AggregateProduct> = pipelineResult[0].data;

        const productRecords: Array<CatalogResponse> = products.map(
            (product) => {
                let discountPrice: number | null = null;
                const activePromos = product.promotions.filter((promotion) => {
                    const now = new Date(Date.now());
                    const startDate = new Date(promotion.startDate);
                    const endDate = new Date(promotion.endDate);
                    return (
                        promotion.active === true &&
                        startDate < now &&
                        endDate > now
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
                            product.price -
                            product.price * activePromo.discountValue;
                    } else {
                        discountPrice =
                            product.price - activePromo.discountValue;
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
            }
        );

        return { totalCount, productRecords };
    } catch (error) {
        throw error;
    }
};

////// GET SORTED AND FILTERED ADMIN PRODUCTS //////

export const getAdminProducts = async (
    filters: AdminProductFilters,
    transaction?: Transaction
) => {
    try {
        if (!filters.sort) {
            filters.sort = "name-ascend";
        }

        const { page, offset } = calculatePagination(
            +filters.page || 1,
            +filters.itemsPerPage
        );

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
            transaction,
        })) as unknown as JoinReqCountAdminProduct;

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
    } catch (error) {
        throw error;
    }
};

//////////////////////////////////////////////////////////////////////////

export const getOneProduct = async (productNo: string) => {
    try {
        const result: PopulatedProductItem | null = await Product.findOne({
            productNo: productNo,
        })
            .populate<{ category: CategoryItem }>("category")
            .exec();

        if (!result) {
            throw new Error("Product not found");
        }

        const category: CategoryItem | null = result.category;

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

export const getCatalogProductDetails = async (
    productNo: string,
    username: string | null = null
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const result: PopulatedProductItem | null = await Product.findOne({
            productNo: productNo,
        })
            .populate<{ category: CategoryItem }>("category")
            .exec();

        if (!result) {
            throw new Error("Product not found");
        }

        const category: CategoryItem | null = result.category;

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

        if (username) {
            const customerId = await getCustomerIdFromUsername(username);
            if (customerId) {
                const foundCustomer = await sqlCustomer.findOne({
                    where: { customer_id: customerId },
                    transaction: sqlTransaction,
                });
                if (foundCustomer) {
                    const timestamp = new Date().toISOString();
                    const recentlyViewed: Array<RecentlyViewedItem> =
                        foundCustomer.recentlyViewed || [];

                    const foundIndex = recentlyViewed.findIndex(
                        (product) => product.productNo === result.productNo
                    );
                    if (foundIndex !== -1) {
                        recentlyViewed.splice(foundIndex, 1);
                    }
                    if (recentlyViewed.length > 5) {
                        recentlyViewed.pop();
                    }
                    recentlyViewed.unshift({
                        productNo: result.productNo,
                        productName: result.name,
                        thumbnailUrl: result.images[0],
                        timestamp,
                    });

                    foundCustomer.set("recentlyViewed", recentlyViewed);
                    foundCustomer.changed("recentlyViewed", true);

                    await foundCustomer.save({ transaction: sqlTransaction });
                }
            }
        }
        await sqlTransaction.commit();
        return productData;
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

//////////////////////////////////////////////////////////////////////////

export const createProduct = async (
    productData: CreateProduct,
    images: Array<{
        fileContent: Buffer;
        fileName: string;
        mimeType: string;
    }>
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
            tags = null,
        } = productData;
        const productNo = await generateProductNo(prefix);
        const nameStrippedArr = name.trim().split(" ");
        const capitalizedNameArr = nameStrippedArr.map(
            (word) => `${word[0].toUpperCase()}${word.substring(1)}`
        );
        const sanitizedName = capitalizedNameArr.join(" ");

        // Upload images to S3 and get URLs
        const imageUrls = await processImages(images);

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
            productName: sanitizedName,
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
        const categoryId: Types.ObjectId = categoryDoc._id;

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

        let validTagIds: Array<Types.ObjectId> | null;

        if (tags) {
            const tagIds = await Promise.all(
                tags.map(async (tagName): Promise<Types.ObjectId | null> => {
                    const tagDoc = await Tag.findOne({ name: tagName });
                    return tagDoc ? tagDoc._id : null;
                })
            );

            validTagIds = tagIds.filter(
                (id): id is Types.ObjectId => id != null
            );
        } else {
            validTagIds = null;
        }

        await Product.create(
            [
                {
                    productNo: productNo,
                    name: sanitizedName,
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
        throw error;
    } finally {
        await session.endSession();
    }
};

//////////////////////////////////////////////////////////////////////////

export const updateProductDetails = async (
    productData: UpdateProduct,
    images: Array<{
        fileContent: Buffer;
        fileName: string;
        mimeType: string;
    }>
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
            tags = null,
        } = productData;

        // Delete unused images from S3
        const targetProduct = await Product.findOne(
            {
                productNo: productNo,
            },
            null,
            { session: session }
        );

        if (!targetProduct) {
            throw new Error("Product not found in mongo database");
        }

        const imagesToDelete = targetProduct.images.filter(
            (imageUrl) => !existingImageUrls.includes(imageUrl)
        );

        if (imagesToDelete.length > 0) {
            for (const imageUrl of imagesToDelete) {
                const splitUrl = imageUrl.split("/");
                const fileName = splitUrl[splitUrl.length - 1];
                console.log("DELETING", fileName);
                await deleteFile(fileName);
            }
        }

        // Upload images to S3 and get URLs

        let newImageUrls: string[] | null = null;

        if (images.length > 0) {
            newImageUrls = await processImages(images);
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
        throw error;
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
        throw error;
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
            const deletionPromises = imagesToDelete.map(async (imageUrl) => {
                const splitUrl = imageUrl.split("/");
                const fileName = splitUrl[splitUrl.length - 1];
                console.log("DELETING", fileName);
                await deleteFile(fileName);
            });

            await Promise.all(deletionPromises);
        }

        await session.commitTransaction();
        await sqlTransaction.commit();

        return { success: true, message: "product successfully deleted" };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        throw error;
    } finally {
        await session.endSession();
    }
};
