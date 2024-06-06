const Product = require("../models/mongo/productModel");
const Category = require("../models/mongo/categoryModel");
const Tag = require("../models/mongo/tagModel");
const sqlCategory = require("../models/mysql/sqlCategoryModel");
const sqlProduct = require("../models/mysql/sqlProductModel");
const sqlInventory = require("../models/mysql/sqlInventoryModel");
const sqlProductCategory = require("../models/mysql/sqlProductCategoryModel");
const generateProductNo = require("../utils/generateProductNo");

// Types and interfaces
import { ClientSession } from "mongoose";
import { Types } from "mongoose";
import { ProductItem } from "../models/mongo/productModel";
import { TagItem } from "../models/mongo/tagModel";
import { CreateProduct } from "../controllers/productController";
type BooleString = { success: boolean; message: string };

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

type Size = "small" | "medium" | "large";
interface FilterObject {
    search?: string;
    category?: string;
    tags?: string;
    page: number;
    size?: Size[];
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
    minCircum?: string;
    maxCircum?: string;
    minDiam?: string;
    maxDiam?: string;
    sortMethod: string;
    itemsPerPage: string;
}

//get sorted and filtered products
exports.getProducts = async (filters: FilterObject) => {
    const skip = (filters.page - 1) * +filters.itemsPerPage;
    let categoryId: Types.ObjectId | undefined;

    // Retrieve category and tag object ids if names are provided
    if (filters.category) {
        const cat = await Category.findOne({ name: filters.category }).exec();
        if (cat) {
            categoryId = cat._id;
        }
    }
    let tagIds: Array<Types.ObjectId> | undefined;
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
    if (categoryId) {
        query = query.where({ category: categoryId });
    }

    // Narrow by tag
    if (tagIds) {
        query = query.where({ tag: { $in: tagIds } });
    }

    // Narrow by size
    if (filters.size) {
        query = query.where({ "attributes.size": { $in: filters.size } });
    }

    // Narrow by color
    if (filters.color) {
        query = query.where({ "attributes.color": { $in: filters.color } });
    }

    // Narrow by material
    if (filters.material) {
        query = query.where({
            "attributes.material": { $in: filters.material },
        });
    }

    // Define and iterate through all min-max parameters and add query params asneeded
    const minMaxParams = [
        "price",
        "width",
        "height",
        "depth",
        "circum",
        "diam",
    ];
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

    if (totalCount === 0) {
        throw new Error("No products found matching search parameters");
    }

    // Get results with number limited and page of results specified
    const products: Array<ProductItem> = await query
        .skip(skip)
        .limit(filters.itemsPerPage)
        .exec();

    return { totalCount, products };
};

//get one product

exports.getOneProduct = async (productNo: string) => {
    let result: ProductItem = await Product.findOne({ productNo: productNo });
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

    let results: Array<ProductItem> = await Product.findOne({
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
    const session: ClientSession = mongoose.startSession();
    session.startTransaction();
    try {
        const {
            name,
            category,
            prefix,
            description,
            attributes,
            price,
            stock = 0,
            images = [],
            tags,
        } = productData;
        const productNo = generateProductNo(prefix);

        //Construct SQL product
        const abbrDesc = description.substring(0, 79) + "...";
        const newProduct = await sqlProduct.create({
            productNo,
            productName: name,
            description: abbrDesc,
            price,
        });

        // add SQL categories
        for (const categoryName of category) {
            const category = await sqlCategory.findOne({
                where: { categoryName },
            });
            if (category) {
                await sqlProductCategory.create({
                    categoryName: category.categoryName,
                    productNo: newProduct.productNo,
                });
            }
        }

        // create SQL inventory record
        await sqlInventory.create({
            productNo: newProduct.productNo,
            stock: stock,
        });

        // MongoDB operations
        const categoryIds = await Promise.all(
            category.map(async (catName): Promise<Types.ObjectId | null> => {
                const categoryDoc = await Category.findOne({ name: catName });
                return categoryDoc ? categoryDoc._id : null;
            })
        );

        const validCategoryIds: Types.ObjectId[] = categoryIds.filter(
            (id): id is Types.ObjectId => id != null
        );

        const tagIds = await Promise.all(
            tags.map(async (tagName): Promise<Types.ObjectId | null> => {
                const tagDoc = await Tag.findOne({ name: tagName });
                return tagDoc ? tagDoc._id : null;
            })
        );

        const validTagIds: Types.ObjectId[] = tagIds.filter(
            (id): id is Types.ObjectId => id != null
        );

        const newMongoProduct: ProductItem = await Product.create({
            productNo: productNo,
            name: name,
            category: validCategoryIds,
            description: description,
            attributes: attributes,
            price: price,
            promotions: [],
            stock: stock,
            images: images,
            tags: validTagIds,
        });

        await session.commitTransaction();
        return {
            success: true,
            message: `Product successfully added to databases`,
        };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error adding promotion: " + error.message);
        } else {
            throw new Error("An unknown error occurred while adding promotion");
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
