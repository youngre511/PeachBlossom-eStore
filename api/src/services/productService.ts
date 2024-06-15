import Product, { ProductItem } from "../models/mongo/productModel";
import Category, { SubCategoryItem } from "../models/mongo/categoryModel";
import Tag, { TagItem } from "../models/mongo/tagModel";
import { sqlCategory } from "../models/mysql/sqlCategoryModel";
import { sqlProduct } from "../models/mysql/sqlProductModel";
import { sqlInventory } from "../models/mysql/sqlInventoryModel";
import generateProductNo from "../utils/generateProductNo";
import sequelize from "../models/mysql";

import mongoose, { ClientSession, Types, Schema } from "mongoose";
import { CreateProduct } from "../controllers/productController";
import { sqlSubCategory } from "../models/mysql/sqlSubCategoryModel";
import { BooleString } from "../../types/api_resp";

type Color =
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

type Material =
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
    page: number;
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
    sortMethod: string;
    itemsPerPage: string;
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

//get sorted and filtered products
exports.getProducts = async (filters: FilterObject) => {
    const skip = (filters.page - 1) * +filters.itemsPerPage;
    let categoryId: Schema.Types.ObjectId | undefined;
    let subCategoryId: Schema.Types.ObjectId | undefined;

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
            query = query.where(param).gte(filters[minParam] as number);
        }
        if (filters[maxParam]) {
            query = query.where(param).lte(filters[maxParam] as number);
        }
    }

    const validSortMethods = [
        "price-ascend",
        "price-descend",
        "name-ascend",
        "name-descend",
    ];

    // Add sort parameters
    if (validSortMethods.includes(filters.sortMethod)) {
        const sortParams = filters.sortMethod.split("-");
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

//get one product

exports.getOneProduct = async (productNo: string) => {
    let result: ProductItem | null = await Product.findOne({
        productNo: productNo,
    });
    if (!result) {
        throw new Error("Product not found");
    }

    return result;
};

//get products by category

exports.getProductsByCategory = async (categoryName: string) => {
    const categoryId = Category.findOne({ name: categoryName });
    if (!categoryId) {
        throw new Error("Category not found");
    }

    let results: Array<ProductItem> | null = await Product.findOne({
        category: categoryId,
    });
    if (!results) {
        throw new Error("No products found");
    }

    return results;
};

exports.createProduct = async (
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

        //Construct SQL product
        const abbrDesc = description.substring(0, 79) + "...";
        const sqlCatRec = await sqlCategory.findOne({
            where: { categoryName: category },
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

        const newSQLProduct = {
            productNo: productNo,
            productName: name,
            price: price,
            description: abbrDesc,
            category_id: sqlCategoryId,
            subCategory_id: sqlSubCategoryId,
        };

        const createdProduct = await sqlProduct.create(newSQLProduct, {
            transaction: sqlTransaction,
        });

        // create SQL inventory record
        await sqlInventory.create(
            {
                productNo: createdProduct.productNo,
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

        let subCategoryId: Schema.Types.ObjectId | null;
        if (subCategory) {
            const filteredSubCat = categoryDoc.subCategories.filter(
                (subCat: { name: string; _id: Schema.Types.ObjectId }) =>
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

        const newMongoProduct: ProductItem = await Product.create({
            productNo: productNo,
            name: name,
            category: categoryId,
            subCategory: subCategoryId,
            description: description,
            attributes: attributes,
            price: price,
            promotions: [],
            stock: stock,
            images: images,
            tags: validTagIds,
        });

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

//update basic product details (name, description, images)

//update product stock

//update product price

//delete single product
//also delete from sql in all locations
