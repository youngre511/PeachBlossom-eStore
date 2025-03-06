///////////////////////
///////Constants///////
///////////////////////

import { ImageListType } from "react-images-uploading";
import { OneProduct } from "./AVProductDetails/AVProductDetails";

export const colorOptions = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "gold",
    "silver",
    "white",
    "gray",
    "black",
    "brown",
    "cream",
    "beige",
    "multicolor",
    "clear",
];
export const materialOptions = [
    "glass",
    "plastic",
    "ceramic",
    "metal",
    "wood",
    "fabric",
    "leather",
    "stone",
    "rubber",
    "resin",
    "natural fiber",
    "bamboo",
];

//////////////////////////////
///////Helper Functions///////
//////////////////////////////

export const constructProductFormData = (
    productName: string,
    price: string,
    category: string,
    subcategory: string,
    description: string,
    images: ImageListType,
    color: string,
    materials: string[],
    weight: number | string,
    height: number | string,
    width: number | string,
    depth: number | string,
    currentDetails: OneProduct
): FormData => {
    const formData = new FormData();

    if (productName !== currentDetails.name) {
        formData.append("name", productName);
    }
    if (price !== String(currentDetails.price)) {
        formData.append("price", price);
    }
    if (category !== currentDetails.category) {
        formData.append("category", category);
    }
    if (subcategory !== currentDetails.subcategory) {
        formData.append("subcategory", subcategory);
    }
    if (description !== currentDetails.description) {
        formData.append("description", description);
    }

    let usedFileNames: string[] = [];
    if (images) {
        images.forEach((image, index) => {
            let newFileName = `${productName
                .replace(/\s+/g, "_")
                .toLowerCase()}`;
            let i = 1;
            newFileName = `${newFileName}_${i}`;
            while (
                currentDetails.images.includes(
                    `${import.meta.env.VITE_CLOUDFRONT_DOMAIN}/${newFileName}`
                ) ||
                usedFileNames.includes(newFileName)
            ) {
                newFileName = newFileName.replace(`_${i}`, `_${i + 1}`);
                i++;
            }
            usedFileNames.push(newFileName);
            formData.append("images", image.file as File, newFileName);
        });
    }

    if (
        color !== currentDetails.attributes.color ||
        materials !== currentDetails.attributes.material ||
        +weight !== currentDetails.attributes.weight ||
        +height !== currentDetails.attributes.dimensions.height ||
        +width !== currentDetails.attributes.dimensions.width ||
        +depth !== currentDetails.attributes.dimensions.depth
    ) {
        formData.append(
            "attributes",
            JSON.stringify({
                color: color,
                material: materials,
                weight: +weight,
                dimensions: {
                    width: +width,
                    height: +height,
                    depth: +depth,
                },
            })
        );
    }

    return formData;
};
