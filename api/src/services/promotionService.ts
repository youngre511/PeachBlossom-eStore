const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const generatePromoNo = require('../utils/generatePromoNo')

import { Promotion } from '../models/productModel'
import { CreatePromo } from '../controllers/productController'

type PromoUpdate = Partial<Promotion>


//get all products in a promotion
exports.getProductsInPromotion = async (promoNum: string) => {
    
    //insert logic to check SQL and ensure promoNum is valid
    
    const productArray = await Product.find({"promotions.promoId": promoNum})

    if (!productArray) {
        throw new Error ("No products found matching criteria")
    }

    return productArray
}


//add promotion to a single product
exports.addProductPromo = async (target: number, promotion: string | CreatePromo) => {
    const productToUpdate = await Product.findOne({productNo: target})

    if(!productToUpdate) {
        throw new Error("Product not found")
    }

    if (typeof promotion === 'string') {

    } 
    if (typeof promotion === 'object') {
        const newPromo: Promotion = {
            ...promotion,
            promoId: generatePromoNo()
        }
        productToUpdate.promotions.push(newPromo)
    }
}


//add promotion to all products in a category

//update promotion attached to a single product
exports.updateProductPromo = async (productNo: number, promoNumber: number, promotion: PromoUpdate) {
    const productToUpdate = await Product.findOne({productNo: productNo})

}

//update promotion by number for all products in a category
exports.updatePromoByCategory = async (categoryName: string, promoNumber: number, updatedPromotion: PromoUpdate) => {
    const categoryId = await Category.findOne({name: categoryName})

}

//delete promotion attached to a single product

//delete promotion attached to a single category



