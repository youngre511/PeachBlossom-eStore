import { FormControl, FormGroup, IconButton } from "@mui/material";
import React, { SetStateAction } from "react";
import { useEffect } from "react";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import CategoryFilters from "./FilterSections/CategoryFilters";
import ColorFilters from "./FilterSections/ColorFilters";
import MaterialFilters from "./FilterSections/MaterialFilters";
import MinMaxFields from "./FilterSections/MinMaxFields";
import DimensionFilters from "./FilterSections/DimensionFilters";
import PeachButton from "../../../common/components/PeachButton";
import { Filters } from "../ProductCatalog/CatalogTypes";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";

interface MobileFiltersProps {
    addCategory: (category: string) => void;
    addSubcategory: (subcategory: string) => void;
    colors: string[][];
    handleColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    materials: string[][];
    handleMaterialsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    dimensions: string[];
    setLocalFilters: React.Dispatch<SetStateAction<Filters>>;
    localFilters: Filters;
    handleSubmit: () => void;
    handleReset: () => void;
    handleFilterDrawerClose: () => void;
}
const MobileFilters: React.FC<MobileFiltersProps> = ({
    addCategory,
    addSubcategory,
    colors,
    handleColorChange,
    materials,
    handleMaterialsChange,
    dimensions,
    localFilters,
    setLocalFilters,
    handleSubmit,
    handleReset,
    handleFilterDrawerClose,
}) => {
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalog.filters
    );

    return (
        <div className="filter-options-drawer">
            <div className="filter-header">
                <h1>Filter</h1>
                <IconButton onClick={() => handleFilterDrawerClose()}>
                    <CloseSharpIcon />
                </IconButton>
            </div>
            <FormControl>
                <div className="filters">
                    {!existingFilters.subcategory && (
                        <div className="filter-section">
                            <h2 className="filter-type">
                                {existingFilters.category
                                    ? "Subcategory"
                                    : "Category"}
                            </h2>

                            <CategoryFilters
                                addCategory={addCategory}
                                addSubcategory={addSubcategory}
                            />
                        </div>
                    )}

                    <div className="filter-section">
                        <h2 className="filter-type">Color</h2>
                        <ColorFilters
                            colors={colors}
                            localFilters={localFilters}
                            handleColorChange={handleColorChange}
                        />
                    </div>
                    <div className="filter-section">
                        <h2 className="filter-type">Material</h2>
                        <MaterialFilters
                            materials={materials}
                            localFilters={localFilters}
                            handleMaterialsChange={handleMaterialsChange}
                        />
                    </div>
                    <div className="filter-section">
                        <div className="price-filters">
                            <FormGroup
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <p className="dimension-label">Price</p>
                                <MinMaxFields
                                    minValue={localFilters.minPrice || ""}
                                    maxValue={localFilters.maxPrice || ""}
                                    prefix="$"
                                    formatFunction={(value: string) =>
                                        Number(value).toFixed(2)
                                    }
                                    setLocalFilters={setLocalFilters}
                                    param="price"
                                />
                            </FormGroup>
                        </div>
                    </div>
                    <div className="filter-section">
                        <h2 className="filter-type">Dimensions (in inches)</h2>
                        <DimensionFilters
                            setLocalFilters={setLocalFilters}
                            localFilters={localFilters}
                            dimensions={dimensions}
                        />
                    </div>
                </div>
                <div className="filter-submit-buttons">
                    <PeachButton
                        text="Filter"
                        onClick={() => {
                            handleSubmit();
                            handleFilterDrawerClose();
                        }}
                    />
                    <PeachButton
                        text="Reset Filter"
                        onClick={handleReset}
                        width="120px"
                    />
                </div>
            </FormControl>
        </div>
    );
};
export default MobileFilters;
