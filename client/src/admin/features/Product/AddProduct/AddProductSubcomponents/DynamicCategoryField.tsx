import { TextField } from "@mui/material";
import React, { ComponentProps, useCallback } from "react";
import { useEffect } from "react";
import { AVCategory } from "../../../../store/AVMenuData/avMenuDataTypes";
import { SelectField } from "../../../../../common/components/Fields/SelectField";
import { useFormikContext } from "formik";
import { Submission } from "../AddProduct";

//Dynamic category is an extra layer on top of SelectField that allows the category field to update the subcategories field based on user selection

interface DynamicCategoryFieldProps {
    label: string;
    name: string;
    multiple: boolean;
    options: string[];
    required: boolean;
    sx?: ComponentProps<typeof TextField>["sx"];
    categories: AVCategory[];
    setSubcategories: React.Dispatch<
        React.SetStateAction<string[] | "disabled">
    >;
}

const DynamicCategoryField: React.FC<DynamicCategoryFieldProps> = ({
    label,
    name,
    options,
    required,
    sx,
    categories,
    setSubcategories,
}) => {
    const { values } = useFormikContext<Submission>();
    const memoizedSetSubcategories = useCallback(
        (subcategories: string[] | "disabled") => {
            setSubcategories(subcategories);
        },
        [setSubcategories]
    );

    useEffect(() => {
        if (values.category) {
            const selectedCategory = categories.find(
                (category) => category.categoryName === values.category
            );
            if (selectedCategory && selectedCategory.Subcategory.length > 0) {
                memoizedSetSubcategories(
                    selectedCategory.Subcategory.map(
                        (subcategory) => subcategory.subcategoryName
                    )
                );
            } else {
                memoizedSetSubcategories("disabled");
            }
        }
    }, [values.category, categories, memoizedSetSubcategories]);

    useEffect(() => {
        console.log("values.category useEffect", values.category, Date.now());
    }, [values.category]);

    return (
        <SelectField
            label={label}
            name={name}
            multiple={false}
            required={required}
            options={options}
            sx={sx}
        />
    );
};
export default DynamicCategoryField;
