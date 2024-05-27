const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

import {Promotion} from '../models/productModel'

type PromoUpdate = Partial<Promotion>

//add promotion to a single product
exports.addProductPromo = async (productNo: number, promotion: number | PromoUpdate) => {
    const productToUpdate = await Product.findOne({productNo: productNo})
    if (typeof promotion === 'number') {

    } else {
        productToUpdate.promotions
    }
}


//add promotion to all products in a category

//update promotion attached to a single product
exports.updateProductPromo = async (productNo: number, promoNumber: number, promotion: PromoUpdate) {
    const productToUpdate = await Product.findOne({productNo: productNo})

}

//update promotion by number for all products in a category
exports.updatePromotionsByCategory = async (categoryName: string, promoNumber: number, updatedPromotion: PromoUpdate) => {
    const categoryId = await Category.findOne({name: categoryName})

}

//delete promotion attached to a single product

//delete promotion attached to a single category



