import Category from "../models/mongo/categoryModel.js";
import * as categoryService from "../services/categoryService.js";

import { BooleString } from "../../types/api_resp.js";
import { Request, Response } from "express";
import {
    CategoryCreateRequest,
    CategoryParamsNameRequest,
    CategoryUpdateRequest,
    SubcategoryCreateRequest,
    SubcategoryParamsNameRequest,
} from "./_controllerTypes.js";

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const results: Array<{
            categoryName: string;
            productCount: number;
            Subcategory: { subcategoryName: string; productCount: number }[];
        }> = await categoryService.getAllCategories();

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "get all Category failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getCategoryByName = async (
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

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const createCategory = async (
    req: CategoryCreateRequest,
    res: Response
) => {
    try {
        // Accepting the front-end form data from the client to generate the document
        const { name } = req.body;
        const response: BooleString = await categoryService.createCategory(
            name
        );

        res.json({
            message: "success",
            payload: response,
        });
    } catch (error) {
        let errorObj = {
            message: "create Category failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const createSubcategory = async (
    req: SubcategoryCreateRequest,
    res: Response
) => {
    try {
        // Accepting the front-end form data from the client to generate the document
        const { categoryName } = req.params;
        const { subcategoryName } = req.body;
        const response: BooleString = await categoryService.createSubcategory(
            categoryName,
            subcategoryName
        );

        res.json({
            message: "success",
            payload: response,
        });
    } catch (error) {
        let errorObj = {
            message: "create sub category failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const updateCategoryName = async (
    req: CategoryUpdateRequest,
    res: Response
) => {
    try {
        const { oldName, newName } = req.body;
        const result: BooleString = await categoryService.updateCategoryName(
            oldName,
            newName
        );
        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "update category name failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const updateSubcategoryName = async (
    req: CategoryUpdateRequest,
    res: Response
) => {
    try {
        const { oldName, newName } = req.body;
        const result: BooleString = await categoryService.updateSubcategoryName(
            oldName,
            newName
        );
        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "update category name failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const deleteCategory = async (
    req: CategoryParamsNameRequest,
    res: Response
) => {
    const { name } = req.params;
    try {
        const result = await categoryService.deleteCategory(name);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "delete category failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const deleteSubcategory = async (
    req: SubcategoryParamsNameRequest,
    res: Response
) => {
    const { subcategoryName } = req.params;
    try {
        const result = await categoryService.deleteSubcategory(subcategoryName);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "delete Category failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
