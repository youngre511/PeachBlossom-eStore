import React from "react";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { RootState } from "../../store/store";
import { useAppSelector } from "../../hooks/reduxHooks";
import {
    FormControl,
    FormControlLabel,
    FormGroup,
    Checkbox,
} from "@mui/material";
import { Filters } from "../ProductCatalogue/CatalogueTypes";

interface Props {
    updateSearchParams: (newFilters: Record<string, string>) => void;
}

const FilterOptions: React.FC<Props> = ({ updateSearchParams }: Props) => {
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalogue.filters
    );
    const [localFilters, setLocalFilters] = useState<Filters>({
        search: null,
        category: null,
        subCategory: null,
        size: null,
        color: null,
        minPrice: null,
        maxPrice: null,
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        minDepth: null,
        maxDepth: null,
        minCircum: null,
        maxCircum: null,
        minDiam: null,
        maxDiam: null,
        tags: null,
        material: null,
        sortMethod: "name-ascend",
        page: "1",
    });

    useEffect(() => {
        setLocalFilters(existingFilters);
    }, [existingFilters]);

    const colors = ["red"];
    const materials = ["glass"];

    return (
        <div className="filter-options">
            {!existingFilters.category && (
                <div className="category-filters"></div>
            )}
            {existingFilters.category && !existingFilters.subCategory && (
                <div className="subcategory-filters"></div>
            )}
            <FormControl>
                <div className="color-filters">
                    <FormGroup>
                        {colors.map((color) => {
                            const colorElement =
                                localFilters.color &&
                                localFilters.color.includes(color) ? (
                                    <Checkbox defaultChecked />
                                ) : (
                                    <Checkbox />
                                );
                            return (
                                <FormControlLabel
                                    control={colorElement}
                                    label={color}
                                />
                            );
                        })}
                    </FormGroup>
                </div>
                <div className="material-filters">
                    <FormGroup>
                        {materials.map((material) => {
                            const materialElement =
                                localFilters.material &&
                                localFilters.material.includes(material) ? (
                                    <Checkbox defaultChecked />
                                ) : (
                                    <Checkbox />
                                );
                            return (
                                <FormControlLabel
                                    control={materialElement}
                                    label={material}
                                />
                            );
                        })}
                    </FormGroup>
                </div>
                <div className="size-filters">
                    <FormGroup>
                        {["small", "medium", "large"].map((size) => {
                            const sizeElement =
                                localFilters.size &&
                                localFilters.size.includes(size) ? (
                                    <Checkbox defaultChecked />
                                ) : (
                                    <Checkbox />
                                );
                            return (
                                <FormControlLabel
                                    control={sizeElement}
                                    label={size}
                                />
                            );
                        })}
                    </FormGroup>
                </div>
                <div className="dimension-filters"></div>
            </FormControl>
        </div>
    );
};
export default FilterOptions;
