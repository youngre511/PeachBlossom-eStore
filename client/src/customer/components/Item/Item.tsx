import React from "react";
import { useEffect } from "react";

interface ItemProps {
    productNo: string;
    name: string;
    description: string;
    attributes: {
        color: string;
        material?: string;
        size?: string;
        weight: number;
        dimensions: {
            width?: number;
            height?: number;
            depth?: number;
            diameter?: number;
            circumference?: number;
        };
    };
    price: number;
    promotions: {
        promoId: string;
        name: string;
        description: string;
        discountType: "percentage" | "fixed";
        discountValue: number;
        startDate: string;
        endDate: string;
        active: boolean;
    };
    stock: number;
    images: string[];
    tags: string[];
}
const Item: React.FC<Props> = ({
    productNo,
    name,
    description,
    attributes,
    price,
    promotions,
    stock,
    images,
    tags,
}: ItemProps) => {
    return <div className="item"></div>;
};
export default Item;
