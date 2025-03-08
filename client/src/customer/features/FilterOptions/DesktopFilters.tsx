import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    FormControl,
    FormGroup,
    useTheme,
} from "@mui/material";
import React, { SetStateAction } from "react";
import CategoryFilters from "./FilterSections/CategoryFilters";
import ColorFilters from "./FilterSections/ColorFilters";
import MaterialFilters from "./FilterSections/MaterialFilters";
import MinMaxFields from "./FilterSections/MinMaxFields";
import DimensionFilters from "./FilterSections/DimensionFilters";
import PeachButton from "../../../common/components/PeachButton";
import { Filters } from "../Shop/CatalogTypes";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import ChevronRightSharpIcon from "@mui/icons-material/ChevronRightSharp";

interface DesktopFiltersProps {
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
}
const DesktopFilters: React.FC<DesktopFiltersProps> = ({
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
}) => {
    const theme = useTheme();
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalog.filters
    );

    const accordionSx = {
        width: "320px",
        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(90deg)",
        },
        "& .MuiAccordionSummary-content": {
            marginLeft: theme.spacing(1),
        },
    };

    return (
        <div className="filter-options">
            <FormControl>
                {!existingFilters.subcategory && (
                    <Accordion
                        disableGutters
                        square
                        defaultExpanded={false}
                        sx={accordionSx}
                    >
                        <AccordionSummary
                            expandIcon={<ChevronRightSharpIcon />}
                        >
                            {existingFilters.category
                                ? "Subcategory"
                                : "Category"}
                        </AccordionSummary>
                        <AccordionDetails>
                            <CategoryFilters
                                addCategory={addCategory}
                                addSubcategory={addSubcategory}
                            />
                        </AccordionDetails>
                    </Accordion>
                )}
                <Accordion
                    disableGutters
                    square
                    defaultExpanded={
                        localFilters.color && localFilters.color.length > 0
                            ? true
                            : false
                    }
                    sx={accordionSx}
                >
                    <AccordionSummary expandIcon={<ChevronRightSharpIcon />}>
                        Color
                    </AccordionSummary>
                    <AccordionDetails sx={{ margin: 1 }}>
                        <ColorFilters
                            colors={colors}
                            localFilters={localFilters}
                            handleColorChange={handleColorChange}
                        />
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    disableGutters
                    square
                    defaultExpanded={
                        localFilters.material &&
                        localFilters.material.length > 0
                            ? true
                            : false
                    }
                    sx={accordionSx}
                >
                    <AccordionSummary expandIcon={<ChevronRightSharpIcon />}>
                        Material
                    </AccordionSummary>
                    <AccordionDetails sx={{ margin: 1 }}>
                        <MaterialFilters
                            materials={materials}
                            localFilters={localFilters}
                            handleMaterialsChange={handleMaterialsChange}
                        />
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    disableGutters
                    square
                    defaultExpanded={
                        !!localFilters.maxPrice || !!localFilters.minPrice
                    }
                    sx={accordionSx}
                >
                    <AccordionSummary expandIcon={<ChevronRightSharpIcon />}>
                        Price
                    </AccordionSummary>
                    <AccordionDetails sx={{ margin: 1 }}>
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
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    disableGutters
                    square
                    defaultExpanded={
                        !!localFilters.minWidth ||
                        !!localFilters.maxWidth ||
                        !!localFilters.minHeight ||
                        !!localFilters.maxHeight ||
                        !!localFilters.minDepth ||
                        !!localFilters.maxDepth
                    }
                    sx={accordionSx}
                >
                    <AccordionSummary expandIcon={<ChevronRightSharpIcon />}>
                        Dimensions (in inches)
                    </AccordionSummary>
                    <AccordionDetails sx={{ margin: 1 }}>
                        <DimensionFilters
                            setLocalFilters={setLocalFilters}
                            localFilters={localFilters}
                            dimensions={dimensions}
                        />
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    disableGutters
                    square
                    sx={{
                        borderTop: 0,
                        "&::before": {
                            backgroundColor: "transparent",
                        },
                    }}
                >
                    <AccordionSummary sx={{ width: "320px" }} component="div">
                        <div className="filter-submit">
                            <PeachButton text="Filter" onClick={handleSubmit} />
                            <PeachButton
                                text="Reset Filter"
                                onClick={handleReset}
                                width="120px"
                            />
                        </div>
                    </AccordionSummary>
                </Accordion>
            </FormControl>
        </div>
    );
};
export default DesktopFilters;
