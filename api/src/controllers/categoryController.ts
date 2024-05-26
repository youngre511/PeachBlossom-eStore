const Category = require("../models/categoryModel");

//Types and Interfaces
import { CategoryItem } from "../models/categoryModel";
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

interface CategoryUpdateRequest extends Request {
    body: {
        oldName: string;
        newName: string;
    };
}

async function getAllCategories(req: Request, res: Response) {
    try {
        let results = await Category.find({});

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
}

async function getCategoryById(req: CategoryParamsIdRequest, res: Response) {
    try {
        let result = await Category.findOne({ _id: req.params.id });

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
}

async function getCategoryByName(
    req: CategoryParamsNameRequest,
    res: Response
) {
    try {
        let result = await Category.findOne({ name: req.params.name });

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "get Category by name failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function createCategory(req: Request, res: Response) {
    try {
        // Accepting the front-end form data from the client to generate the document
        const { prodName } = req.body;

        // post the new document to the Category collection
        const newCategory: CategoryItem = await Category.create({ prodName });

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
}

async function deleteCategory(req: CategoryParamsNameRequest, res: Response) {
    try {
        await Category.deleteOne({ name: req.params.name });

        res.json({
            message: "success",
            payload: req.params.name,
        });
    } catch (error) {
        let errorObj = {
            message: "delete Category failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function updateCategoryName(req: CategoryUpdateRequest, res: Response) {
    try {
        let targetCategory = await Category.findOne({
            name: req.body.oldName,
        });

        // ternaries avoid inputting undefined values
        let updatedCategory = {
            name: req.body.newName ? req.body.newName : targetCategory.name,
        };

        await Category.updateOne(
            { name: req.body.oldName },
            { $set: updatedCategory },
            { upsert: true }
        );

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
}

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    createCategory,
    deleteCategory,
    updateCategoryName,
};
