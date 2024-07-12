import Product, { ProductItem } from "../models/mongo/productModel.js";
import Category, {
    CategoryItem,
    SubCategoryItem,
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
import { sqlSubCategory } from "../models/mysql/sqlSubCategoryModel.js";
import { BooleString } from "../../types/api_resp.js";
import { Op } from "sequelize";
import { JoinReqProduct } from "./cartService.js";
import { Model } from "sequelize-typescript";
import { Order } from "sequelize";

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
    subCategory?: string;
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
    subCategory?: string;
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
    subCategory: string;
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

interface JoinReqSubCategory extends Model {
    subCategory_id: number;
    subCategoryName: string;
    category_id: number;
}

interface AdminProduct extends JoinReqProduct {
    SubCategory: JoinReqSubCategory;
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
        if (parsedProduct.SubCategory) {
            parsedProduct.SubCategory = parsedProduct.SubCategory.get();
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
    let subCategoryId: Types.ObjectId | undefined;

    // Retrieve category and tag object ids if names are provided
    if (filters.category) {
        const cat = await Category.findOne({ name: filters.category }).exec();
        if (cat) {
            categoryId = cat._id;
            if (filters.subCategory) {
                const subCat = cat.subCategories.filter(
                    (subCategory: SubCategoryItem) =>
                        subCategory.name === filters.subCategory
                );
                if (subCat.length === 0) {
                    throw new Error(
                        `Not a valid subcategory of ${filters.category}`
                    );
                } else {
                    subCategoryId = subCat[0]._id;
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
    if (subCategoryId) {
        query = query.where({ subCategory: subCategoryId });
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
        query = query.sort({ [sortParams[1]]: sortOrder });
    }

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
                model: sqlSubCategory,
                as: "SubCategory",
                where: filters.subCategory
                    ? { subCategoryName: filters.subCategory }
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
                subCategory: product.SubCategory.subCategoryName,
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

        const subcategory: SubCategoryItem | null =
            category.subCategories.filter(
                (subcategory) =>
                    String(subcategory._id) === String(result.subCategory)
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
            subCategory = null,
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
        const imageUrls = await Promise.all(
            images.map(async (image) => {
                const { fileContent, fileName, mimeType } = image;
                const uploadResult = await uploadFile(
                    fileContent,
                    fileName,
                    mimeType
                );
                return uploadResult; // URL of the uploaded image
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

        let sqlSubCategoryId: number | null;
        if (subCategory) {
            const subCatRec = await sqlSubCategory.findOne({
                where: { subCategoryName: subCategory },
                transaction: sqlTransaction,
                raw: true,
            });
            if (!subCatRec) {
                throw new Error("subcategory does not exist in SQL database");
            }

            if (subCatRec.category_id !== sqlCategoryId) {
                throw new Error(
                    `${subCategory} is not a subcategory of ${category}`
                );
            }
            sqlSubCategoryId = subCatRec.subCategory_id;
        } else {
            sqlSubCategoryId = null;
        }

        const thumbnailUrl = imageUrls[0] ? imageUrls[0] : null;
        const newSQLProduct = {
            productNo: productNo,
            productName: name,
            price: price,
            description: abbrDesc,
            category_id: sqlCategoryId,
            subCategory_id: sqlSubCategoryId,
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

        let subCategoryId: Types.ObjectId | null;
        if (subCategory) {
            const filteredSubCat = categoryDoc.subCategories.filter(
                (subCat: { name: string; _id: Types.ObjectId }) =>
                    subCat.name === subCategory
            );
            if (filteredSubCat.length === 0) {
                throw new Error(
                    `${subCategory} is not a subcategory of ${category}`
                );
            }
            subCategoryId = filteredSubCat[0]._id;
        } else {
            subCategoryId = null;
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
                    subCategory: subCategoryId,
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
        session.endSession();
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
            subCategory = null,
            description,
            attributes,
            price,
            existingImageUrls,
            images = [],
            tags = null,
        } = productData;
        console.log("received productNo:", productNo);

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
            newImageUrls = await Promise.all(
                images.map(async (image) => {
                    const { fileContent, fileName, mimeType } = image;
                    const uploadResult = await uploadFile(
                        fileContent,
                        fileName,
                        mimeType
                    );
                    return uploadResult; // URL of the uploaded image
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

        console.log("imageUrls:", imageUrls);

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

        //category
        if (category) {
            const foundCategory = await Category.findOne({ name: category });
            if (!foundCategory) {
                throw new Error("Category not found in Mongo.");
            }
            updateFields.category = foundCategory._id;

            const foundSqlCategory = await sqlCategory.findOne({
                where: { categoryName: category },
            });
            if (!foundSqlCategory) {
                throw new Error("Category not found in SQL");
            }
            sqlUpdateFields.category_id = foundSqlCategory.category_id;

            // subcategories
            if (subCategory) {
                const foundSubCategory = foundCategory.subCategories.filter(
                    (subcategory) => subcategory.name === subCategory
                )[0];
                if (!foundSubCategory) {
                    throw new Error("Subcategory not found in Mongo");
                }
                updateFields.subCategory = foundSubCategory._id;

                const foundSqlSubCategory = await sqlSubCategory.findOne({
                    where: {
                        subCategoryName: subCategory,
                        category_id: foundSqlCategory.category_id,
                    },
                });
                if (!foundSqlSubCategory) {
                    throw new Error("Subcategory not found in SQL");
                }
                sqlUpdateFields.subCategory_id =
                    foundSqlSubCategory.subCategory_id;
            }
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

        //UPDATE MONGO
        await Product.findByIdAndUpdate(
            targetProduct._id,
            { $set: updateFields },
            { new: true, session: session }
        ).exec();

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
        session.endSession();
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
                where: { productNo: productNos },
                transaction: sqlTransaction,
            }
        );

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
        session.endSession();
    }
};

//delete single product
//also delete from sql in all locations
