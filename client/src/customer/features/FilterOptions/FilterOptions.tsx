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

interface Props {
    updateSearchParams: (newFilters: Record<string, string>) => void;
}

const FilterOptions: React.FC<Props> = ({ updateSearchParams }: Props) => {
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalog.filters
    );
    const [localFilters, setLocalFilters] = useState<Filters>({
        search: null,
        category: null,
        subCategory: null,
        color: null,
        minPrice: null,
        maxPrice: null,
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        minDepth: null,
        maxDepth: null,
        tags: null,
        material: null,
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

    const timeoutRef = useRef<number | null>(null);

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

    const colors = ["red"];
    const materials = ["glass"];
    const dimensions = ["Price", "Width", "Height", "Depth"];

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
                        {colors.map((color, index) => {
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
                                    key={index}
                                />
                            );
                        })}
                    </FormGroup>
                </div>
                <div className="material-filters">
                    <FormGroup>
                        {materials.map((material, index) => {
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
                                    key={index}
                                />
                            );
                        })}
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
