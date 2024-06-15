import React from "react";
import { Formik } from "formik";
import { useEffect, useState, useRef } from "react";
import { RootState } from "../../store/customerStore";
import { useAppSelector } from "../../hooks/reduxHooks";
import {
    FormControl,
    FormControlLabel,
    FormGroup,
    Checkbox,
    Button,
    InputAdornment,
} from "@mui/material";
import { Filters } from "../ProductCatalog/CatalogTypes";
import DecimalField from "../../../common/components/DecimalField";
import { Category } from "../Categories/CategoriesTypes";

interface Props {
    updateSearchParams: (newFilters: Record<string, string>) => void;
}

const FilterOptions: React.FC<Props> = ({ updateSearchParams }: Props) => {
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalog.filters
    );
    const categories: Category[] = useAppSelector(
        (state: RootState) => state.categories.categories
    );
    const [localFilters, setLocalFilters] = useState<Filters>({
        search: null,
        category: null,
        subCategory: null,
        color: [],
        minPrice: null,
        maxPrice: null,
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        minDepth: null,
        maxDepth: null,
        tags: null,
        material: [],
        sortMethod: "name-ascend",
        page: "1",
    });

    useEffect(() => {
        setLocalFilters(existingFilters);
    }, [existingFilters]);

    const handleSubmit = () => {
        const updates: Record<string, string> = {};
        Object.keys(localFilters).forEach((key) => {
            const filterKey = key as keyof Filters;
            const value = localFilters[filterKey];
            if (value !== null) {
                const updateValue: string = Array.isArray(value)
                    ? (value as string[]).join(",")
                    : value;
                updates[filterKey] = updateValue;
            }
        });
        updateSearchParams(updates);
    };

    const handleReset = () => {
        const resetValues: Record<string, string> = {
            color: "",
            minPrice: "",
            maxPrice: "",
            minWidth: "",
            maxWidth: "",
            minHeight: "",
            maxHeight: "",
            minDepth: "",
            maxDepth: "",
            tags: "",
            material: "",
        };
        setLocalFilters({
            ...localFilters,
            ...resetValues,
        });
        updateSearchParams(resetValues);
    };

    const handleCategoryClick = (category: string, subCategory?: string) => {
        const catUpdate: Record<string, string> = {
            category: category,
        };
        if (subCategory) {
            catUpdate[subCategory] = subCategory;
        }
        setLocalFilters({
            ...localFilters,
            ...catUpdate,
        });
        updateSearchParams(catUpdate);
    };

    const handleColorChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { value, checked } = event.target;
        const currentFilters = localFilters;
        const currentColors = currentFilters.color;
        const newColors = checked
            ? [...(currentColors || []), value]
            : (currentColors || []).filter((color) => color !== value);
        setLocalFilters({ ...localFilters, color: newColors });
    };

    const handleMaterialChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { value, checked } = event.target;
        console.log(value);
        const currentFilters = localFilters;
        const currentMaterials = currentFilters.material;
        const newMaterials = checked
            ? [...(currentMaterials || []), value]
            : (currentMaterials || []).filter((material) => material !== value);
        setLocalFilters({ ...localFilters, material: newMaterials });
    };

    const colors = [
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
    const materials = [
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
    const dimensions = ["Price", "Width", "Height", "Depth"];

    return (
        <div className="filter-options">
            {!existingFilters.category && (
                <div className="category-filters">
                    {categories &&
                        categories.map((category, index) => (
                            <div className="filter-category-cont" key={index}>
                                <p
                                    className="filter-category"
                                    onClick={() =>
                                        handleCategoryClick(category.name)
                                    }
                                >
                                    {category.name}
                                </p>
                                {category.subCategories.length > 0 && (
                                    <div className="filter-subcategory-cont">
                                        {category.subCategories.map(
                                            (subCategory, index) => (
                                                <p
                                                    className="filter-subcategory"
                                                    key={index}
                                                    onClick={() =>
                                                        handleCategoryClick(
                                                            category.name,
                                                            subCategory
                                                        )
                                                    }
                                                >
                                                    {subCategory}
                                                </p>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}
            {existingFilters.category && !existingFilters.subCategory && (
                <div className="subcategory-filters">
                    <p className="filter-category">
                        {existingFilters.category}
                    </p>
                    {categories &&
                        categories.filter(
                            (category) =>
                                category.name === existingFilters.category
                        )[0].subCategories.length > 0 && (
                            <div className="filter-subcategory-cont">
                                {categories
                                    .filter(
                                        (category) =>
                                            category.name ===
                                            existingFilters.category
                                    )[0]
                                    .subCategories.map((subCategory, index) => (
                                        <p
                                            className="filter-subcategory"
                                            key={index}
                                            onClick={() =>
                                                handleCategoryClick(
                                                    existingFilters.category as string,
                                                    subCategory
                                                )
                                            }
                                        >
                                            {subCategory}
                                        </p>
                                    ))}
                            </div>
                        )}
                </div>
            )}
            <FormControl>
                <div className="color-filters">
                    <FormGroup>
                        {colors.map((color, index) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="color"
                                        value={color}
                                        checked={
                                            localFilters.color?.includes(
                                                color
                                            ) || false
                                        }
                                        onChange={handleColorChange}
                                    />
                                }
                                label={color}
                                key={index}
                            />
                        ))}
                    </FormGroup>
                </div>
                <div className="material-filters">
                    <FormGroup>
                        {materials.map((material, index) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="material"
                                        value={material}
                                        checked={
                                            localFilters.material?.includes(
                                                material
                                            ) || false
                                        }
                                        onChange={handleMaterialChange}
                                    />
                                }
                                label={material}
                                key={index}
                            />
                        ))}
                    </FormGroup>
                </div>
                <div className="dimension-filters">
                    {dimensions.map((dimension: string, index: number) => {
                        const minParam = `min${dimension}` as keyof Filters;
                        const maxParam = `max${dimension}` as keyof Filters;
                        return (
                            <FormGroup
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                                key={index}
                            >
                                <p className="dimension-label">{dimension}</p>
                                <div className="min-max-fields">
                                    <DecimalField
                                        label="min"
                                        param={`min${dimension}`}
                                        value={localFilters[minParam] || ""}
                                        setLocalFilters={setLocalFilters}
                                        style={{
                                            width: "80px",
                                            marginLeft: "10px",
                                        }}
                                        // endAdornment={
                                        //     <InputAdornment position="end">
                                        //         in.
                                        //     </InputAdornment>
                                        // }
                                    />
                                    <DecimalField
                                        label="max"
                                        param={`max${dimension}`}
                                        value={localFilters[maxParam] || ""}
                                        setLocalFilters={setLocalFilters}
                                        style={{
                                            width: "80px",
                                            marginLeft: "10px",
                                        }}
                                        // endAdornment={
                                        //     <InputAdornment position="end">
                                        //         in.
                                        //     </InputAdornment>
                                        // }
                                    />
                                </div>
                            </FormGroup>
                        );
                    })}
                </div>
                <div className="filter-submit">
                    <Button variant="contained" onClick={handleSubmit}>
                        Filter
                    </Button>
                    <Button variant="contained" onClick={handleReset}>
                        Reset Filter
                    </Button>
                </div>
            </FormControl>
        </div>
    );
};
export default FilterOptions;
