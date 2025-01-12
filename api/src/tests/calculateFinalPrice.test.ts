import { Op } from "sequelize";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import * as PromotionModel from "../models/mysql/sqlPromotionModel.js";
import { RawJoinReqProduct } from "../services/serviceTypes.js";
import { calculateFinalPrice } from "../utils/calculateFinalPrice.js";

jest.mock("../models/mysql/sqlPromotionModel", () => ({
    sqlPromotion: {
        findAll: jest.fn(),
    },
}));

describe("calculateFinalPrice", () => {
    it("applies a percentage discount (if one exists) correctly and returns finalPrice and promotionId", async () => {
        const product: RawJoinReqProduct = {
            id: 123,
            productNo: "test-product",
            productName: "Natural Test Product",
            price: 100,
            description: "Test product",
            category_id: 123,
            subcategory_id: 123,
            thumbnailUrl: "https://test.com",
            createdAt: new Date("2024-08-08 19:54:02"),
            updatedAt: new Date("2024-09-02 16:04:10"),
            status: "active",
            "Inventory.inventory_id": 123,
            "Inventory.product_id": 123,
            "Inventory.stock": 20,
            "Inventory.reserved": 10,
            "Inventory.available": 10,
        };

        const yesterday = new Date();
        const tomorrow = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const mockPromotion = {
            promo_data_id: 1,
            promotionId: "test-promo-id-123",
            discountType: "percentage",
            promotionName: "Winter Decor Sale",
            promotionDescription: "20% off all throw blankets",
            discountValue: 0.2,
            startDate: yesterday,
            endDate: tomorrow,
            active: 1,
        };

        (PromotionModel.sqlPromotion.findAll as jest.Mock).mockResolvedValue([
            mockPromotion,
        ]);

        const result = await calculateFinalPrice(product);

        expect(result).toEqual({
            finalPrice: 80,
            promotionId: "test-promo-id-123",
        });

        expect(PromotionModel.sqlPromotion.findAll).toHaveBeenCalledWith({
            include: [
                {
                    model: sqlProduct,
                    as: "products",
                    where: { productNo: product.productNo },
                    through: { attributes: [] },
                },
            ],
            where: {
                active: true,
                startDate: { [Op.lte]: expect.any(Date) },
                endDate: { [Op.gte]: expect.any(Date) },
            },
        });
    });

    it("applies a flat discount (if one exists) correctly and returns finalPrice and promotionId", async () => {
        const product: RawJoinReqProduct = {
            id: 123,
            productNo: "test-product",
            productName: "Natural Test Product",
            price: 100,
            description: "Test product",
            category_id: 123,
            subcategory_id: 123,
            thumbnailUrl: "https://test.com",
            createdAt: new Date("2024-08-08 19:54:02"),
            updatedAt: new Date("2024-09-02 16:04:10"),
            status: "active",
            "Inventory.inventory_id": 123,
            "Inventory.product_id": 123,
            "Inventory.stock": 20,
            "Inventory.reserved": 10,
            "Inventory.available": 10,
        };

        const yesterday = new Date();
        const tomorrow = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const mockPromotion = {
            promo_data_id: 2,
            promotionId: "test-promo-id-123",
            discountType: "flat",
            promotionName: "New Customer Discount",
            promotionDescription:
                "Take $10 off your purchase of a throw blanket",
            discountValue: 10,
            startDate: yesterday,
            endDate: tomorrow,
            active: 1,
        };

        (PromotionModel.sqlPromotion.findAll as jest.Mock).mockResolvedValue([
            mockPromotion,
        ]);

        const result = await calculateFinalPrice(product);

        expect(result).toEqual({
            finalPrice: 90,
            promotionId: "test-promo-id-123",
        });

        expect(PromotionModel.sqlPromotion.findAll).toHaveBeenCalledWith({
            include: [
                {
                    model: sqlProduct,
                    as: "products",
                    where: { productNo: product.productNo },
                    through: { attributes: [] },
                },
            ],
            where: {
                active: true,
                startDate: { [Op.lte]: expect.any(Date) },
                endDate: { [Op.gte]: expect.any(Date) },
            },
        });
    });

    it("returns the regular price and no promotionId if no promotion is active", async () => {
        const product: RawJoinReqProduct = {
            id: 123,
            productNo: "test-product",
            productName: "Natural Test Product",
            price: 100,
            description: "Test product",
            category_id: 123,
            subcategory_id: 123,
            thumbnailUrl: "https://test.com",
            createdAt: new Date("2024-08-08 19:54:02"),
            updatedAt: new Date("2024-09-02 16:04:10"),
            status: "active",
            "Inventory.inventory_id": 123,
            "Inventory.product_id": 123,
            "Inventory.stock": 20,
            "Inventory.reserved": 10,
            "Inventory.available": 10,
        };

        const yesterday = new Date();
        const daybefore = new Date();
        yesterday.setDate(yesterday.getDate() - 2);
        daybefore.setDate(daybefore.getDate() + 1);

        (PromotionModel.sqlPromotion.findAll as jest.Mock).mockResolvedValue(
            []
        );

        const result = await calculateFinalPrice(product);

        expect(result).toEqual({
            finalPrice: 100,
            promotionId: undefined,
        });

        expect(PromotionModel.sqlPromotion.findAll).toHaveBeenCalledWith({
            include: [
                {
                    model: sqlProduct,
                    as: "products",
                    where: { productNo: product.productNo },
                    through: { attributes: [] },
                },
            ],
            where: {
                active: true,
                startDate: { [Op.lte]: expect.any(Date) },
                endDate: { [Op.gte]: expect.any(Date) },
            },
        });
    });
});
