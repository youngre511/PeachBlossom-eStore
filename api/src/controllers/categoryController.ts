const Category = require("../models/categoryModel");
const categoryService = require("../services/categoryService");

//Types and Interfaces
import { CategoryItem } from "../models/mongo/categoryModel";
import { Request, Response } from "express";

interface CategoryParamsIdRequest extends Request {
    params: {
        id: string;
    };
}

interface CategoryParamsNameRequest extends Request {
    params: {
        name: string;
    };
}

interface CategoryCreateRequest extends Request {
    body: {
        name: string;
    };
}
interface CategoryUpdateRequest extends Request {
    body: {
        oldName: string;
        newName: string;
    };
}

exports.getAllCategories = async (req: Request, res: Response) => {
    try {
        const results: Array<CategoryItem> =
            await categoryService.getAllCategories();

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "get all Category failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.getCategoryById = async (
    req: CategoryParamsIdRequest,
    res: Response
) => {
    try {
        const result = await categoryService.getCategoryById(req.params.id);

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "get Category by ID failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.getCategoryByName = async (
    req: CategoryParamsNameRequest,
    res: Response
) => {
    try {
        const result = await categoryService.getCategoryByName(req.params.name);

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "get category by name failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.createCategory = async (req: CategoryCreateRequest, res: Response) => {
    try {
        // Accepting the front-end form data from the client to generate the document
        const { name } = req.body;

        const newCategory: CategoryItem = await categoryService.createCategory(
            name
        );

        res.json({
            message: "success",
            payload: newCategory,
        });
    } catch (error) {
        let errorObj = {
            message: "create Category failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.updateCategoryName = async (
    req: CategoryUpdateRequest,
    res: Response
) => {
    try {
        const { oldName, newName } = req.body;
        const updatedCategory: CategoryItem =
            await categoryService.updateCategoryName(oldName, newName);

        res.json({
            message: "success",
            payload: updatedCategory,
        });
    } catch (error) {
        let errorObj = {
            message: "update category name failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.deleteCategory = async (
    req: CategoryParamsNameRequest,
    res: Response
) => {
    const { name } = req.params;
    try {
        const result = await categoryService.deleteCategory(name);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "delete Category failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
