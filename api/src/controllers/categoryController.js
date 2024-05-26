const Category = require('../models/categoryModel');

//Types and Interfaces
import {CategoryItem} from ('../models/categoryModel')

async function getAllCategories (req, res) {
    try {
        let results = await Category.find({});

        res.json({
            message: 'success',
            payload: results
        })
    } catch (error) {
        let errorObj = {
            message: 'get all Category failure',
            payload: error
        }

        console.log(errorObj)

        res.json(errorObj)
    }
}

async function getOneCategory (req, res) {
    try {
        let result = await Category.findOne({propertyName: req.params.propertyName});

        res.json({
            message: 'success',
            payload: result
        })
    } catch (error) {
        let errorObj = {
            message: 'get ONE Category failure',
            payload: error
        }

        console.log(errorObj)

        res.json(errorObj)
    }
}

async function createOneCategory(req, res){
    try {
        // Accepting the front-end form data from the client to generate the document
        let newCategory = req.body



        // post the new document to the Category collection
        await Category.create(newCategory);

        res.json({
            message: 'success',
            payload: newCategory
        });
    } catch (error) {
        let errorObj = {
            message: 'create one Category failure',
            payload: error
        }

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function deleteOneCategory(req, res) {
    try {
        await Category.deleteOne({ propertyName: req.params.propertyName });

        res.json({
            message: 'success',
            payload: req.params.propertyName
        })
    } catch (error) {
        let errorObj = {
            message: 'delete one Category failure',
            payload: error
        }

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function updateOneCategory(req, res){
    try {
        let targetCategory = await Category.findOne({ propertyName: req.params.propertyName })

        // ternaries avoid inputting undefined values
        let updatedCategory = {
            propertyName: req.body.propertyName ? req.body.propertyName : targetCategory.propertyName,
        }

        await Category.updateOne(
            { propertyName: req.params.propertyName },
            { $set: updatedCategory },
            { upsert: true }
        )

        res.json({
            message: 'success',
            payload: updatedCategory
        });
    } catch (error) {
        let errorObj = {
            message: 'update one Category failure',
            payload: error
        }

        console.log(errorObj);

        res.json(errorObj);
    }
}

module.exports = {
    getAllCategorys,
    getOneCategory,
    createOneCategory, 
    deleteOneCategory,
    updateOneCategory
}