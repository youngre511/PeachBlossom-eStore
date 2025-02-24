import React from "react";

import { useEffect, useState } from "react";
import { RootState } from "../../store/customerStore";
import { useAppSelector } from "../../hooks/reduxHooks";
import {
    FormControl,
    FormControlLabel,
    FormGroup,
    Checkbox,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
} from "@mui/material";
import { Filters } from "../ProductCatalog/CatalogTypes";
import DecimalField from "../../../common/components/Fields/DecimalField";
import { Category } from "../Categories/CategoriesTypes";
import { useTheme } from "@mui/material/styles";
import PeachButton from "../../../common/components/PeachButton";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";

import ChevronRightSharpIcon from "@mui/icons-material/ChevronRightSharp";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props {
    updateSearchParams: (newFilters: Record<string, string>) => void;
    addSubcategory: (subcategory: string) => void;
    addSubcategoryAndCategory: (subcategory: string, category: string) => void;
    addCategory: (category: string) => void;
    handleFilterDrawerClose: () => void;
}

const FilterOptions: React.FC<Props> = ({
    updateSearchParams,
    addSubcategory,
    addCategory,
    addSubcategoryAndCategory,
    handleFilterDrawerClose,
}: Props) => {
    const theme = useTheme();
    const { width } = useWindowSizeContext();
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalog.filters
    );
    const categories: Category[] = useAppSelector(
        (state: RootState) => state.categories.categories
    );
    const [localFilters, setLocalFilters] = useState<Filters>({
        search: null,
        category: null,
        subcategory: null,
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
        sort: "name-ascend",
        page: "1",
    });

    const accordionSx = {
        width: "320px",
        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(90deg)",
        },
        "& .MuiAccordionSummary-content": {
            marginLeft: theme.spacing(1),
        },
    };

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
            color: [],
            material: [],
        });
        updateSearchParams(resetValues);
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
        const currentFilters = localFilters;
        const currentMaterials = currentFilters.material;
        const newMaterials = checked
            ? [...(currentMaterials || []), value]
            : (currentMaterials || []).filter((material) => material !== value);
        setLocalFilters({ ...localFilters, material: newMaterials });
    };

    const colors = [
        ["red", "orange"],
        ["yellow", "green"],
        ["blue", "purple"],
        ["pink", "gold"],
        ["silver", "white"],
        ["gray", "black"],
        ["brown", "cream"],
        ["beige", "multicolor"],
        ["clear"],
    ];
    const materials = [
        ["glass", "plastic"],
        ["ceramic", "metal"],
        ["wood", "fabric"],
        ["leather", "stone"],
        ["rubber", "resin"],
        ["natural fiber", "bamboo"],
    ];
    const dimensions = ["Width", "Height", "Depth"];

    return (
        <React.Fragment>
            {width && width > 1154 && (
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
                                    {existingFilters.category ? (
                                        <div className="filter-subcategory-cont">
                                            {categories
                                                .filter(
                                                    (category) =>
                                                        category.categoryName ===
                                                        existingFilters.category
                                                )[0]
                                                .Subcategory.map(
                                                    (subcategory, index) => (
                                                        <div
                                                            className="filter-subcategory"
                                                            key={index}
                                                            onClick={() =>
                                                                addSubcategory(
                                                                    subcategory.subcategoryName
                                                                )
                                                            }
                                                            role="button"
                                                        >
                                                            {
                                                                subcategory.subcategoryName
                                                            }
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    ) : (
                                        <div className="category-filters">
                                            {categories &&
                                                categories.map(
                                                    (category, index) => (
                                                        <div
                                                            className="filter-category-cont"
                                                            key={index}
                                                        >
                                                            <div
                                                                className="filter-category"
                                                                onClick={() =>
                                                                    addCategory(
                                                                        category.categoryName
                                                                    )
                                                                }
                                                                role="button"
                                                            >
                                                                {
                                                                    category.categoryName
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        )}
                        <Accordion
                            disableGutters
                            square
                            defaultExpanded={
                                localFilters.color &&
                                localFilters.color.length > 0
                                    ? true
                                    : false
                            }
                            sx={accordionSx}
                        >
                            <AccordionSummary
                                expandIcon={<ChevronRightSharpIcon />}
                            >
                                Color
                            </AccordionSummary>
                            <AccordionDetails sx={{ margin: 1 }}>
                                <div className="color-filters">
                                    <FormGroup>
                                        {colors.map((colorPair, index) => (
                                            <div
                                                className="checkbox-pair"
                                                key={`colorPair${index}`}
                                            >
                                                <FormControlLabel
                                                    className="color-option"
                                                    control={
                                                        <Checkbox
                                                            name="color"
                                                            value={colorPair[0]}
                                                            checked={
                                                                localFilters.color?.includes(
                                                                    colorPair[0]
                                                                ) || false
                                                            }
                                                            onChange={
                                                                handleColorChange
                                                            }
                                                        />
                                                    }
                                                    label={colorPair[0]}
                                                />
                                                {colorPair.length > 1 && (
                                                    <FormControlLabel
                                                        className="color-option"
                                                        control={
                                                            <Checkbox
                                                                name="color"
                                                                value={
                                                                    colorPair[1]
                                                                }
                                                                checked={
                                                                    localFilters.color?.includes(
                                                                        colorPair[1]
                                                                    ) || false
                                                                }
                                                                onChange={
                                                                    handleColorChange
                                                                }
                                                            />
                                                        }
                                                        label={colorPair[1]}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </FormGroup>
                                </div>
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
                            <AccordionSummary
                                expandIcon={<ChevronRightSharpIcon />}
                            >
                                Material
                            </AccordionSummary>
                            <AccordionDetails sx={{ margin: 1 }}>
                                <div className="material-filters">
                                    <FormGroup>
                                        {materials.map(
                                            (materialPair, index) => (
                                                <div
                                                    className="checkbox-pair"
                                                    key={`materialPair${index}`}
                                                >
                                                    <FormControlLabel
                                                        className="material-option"
                                                        control={
                                                            <Checkbox
                                                                name="material"
                                                                value={
                                                                    materialPair[0]
                                                                }
                                                                checked={
                                                                    localFilters.material?.includes(
                                                                        materialPair[0]
                                                                    ) || false
                                                                }
                                                                onChange={
                                                                    handleMaterialChange
                                                                }
                                                            />
                                                        }
                                                        label={materialPair[0]}
                                                    />
                                                    {materialPair.length >
                                                        1 && (
                                                        <FormControlLabel
                                                            className="material-option"
                                                            control={
                                                                <Checkbox
                                                                    name="material"
                                                                    value={
                                                                        materialPair[1]
                                                                    }
                                                                    checked={
                                                                        localFilters.material?.includes(
                                                                            materialPair[1]
                                                                        ) ||
                                                                        false
                                                                    }
                                                                    onChange={
                                                                        handleMaterialChange
                                                                    }
                                                                />
                                                            }
                                                            label={
                                                                materialPair[1]
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </FormGroup>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion
                            disableGutters
                            square
                            defaultExpanded={
                                !!localFilters.maxPrice ||
                                !!localFilters.minPrice
                            }
                            sx={accordionSx}
                        >
                            <AccordionSummary
                                expandIcon={<ChevronRightSharpIcon />}
                            >
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
                                        <div className="min-max-fields">
                                            <span
                                                style={{
                                                    marginRight: "-5px",
                                                }}
                                            >
                                                $
                                            </span>
                                            <DecimalField
                                                label="min"
                                                param={`minPrice`}
                                                value={
                                                    localFilters.minPrice || ""
                                                }
                                                setLocalFilters={
                                                    setLocalFilters
                                                }
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
                                            <span
                                                style={{
                                                    marginLeft: "10px",
                                                    marginRight: "-5px",
                                                }}
                                            >
                                                &ndash; $
                                            </span>
                                            <DecimalField
                                                label="max"
                                                param={`maxPrice`}
                                                value={
                                                    localFilters.maxPrice || ""
                                                }
                                                setLocalFilters={
                                                    setLocalFilters
                                                }
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
                            <AccordionSummary
                                expandIcon={<ChevronRightSharpIcon />}
                            >
                                Dimensions (in inches)
                            </AccordionSummary>
                            <AccordionDetails sx={{ margin: 1 }}>
                                <div className="dimension-filters">
                                    {dimensions.map(
                                        (dimension: string, index: number) => {
                                            const minParam =
                                                `min${dimension}` as keyof Filters;
                                            const maxParam =
                                                `max${dimension}` as keyof Filters;
                                            return (
                                                <FormGroup
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                    }}
                                                    key={index}
                                                >
                                                    <p className="dimension-label">
                                                        {dimension}
                                                    </p>
                                                    <div className="min-max-fields">
                                                        <DecimalField
                                                            label="min"
                                                            param={`min${dimension}`}
                                                            value={
                                                                localFilters[
                                                                    minParam
                                                                ] || ""
                                                            }
                                                            setLocalFilters={
                                                                setLocalFilters
                                                            }
                                                            style={{
                                                                width: "80px",
                                                                marginLeft:
                                                                    "10px",
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    "10px",
                                                            }}
                                                        >
                                                            &ndash;
                                                        </span>
                                                        <DecimalField
                                                            label="max"
                                                            param={`max${dimension}`}
                                                            value={
                                                                localFilters[
                                                                    maxParam
                                                                ] || ""
                                                            }
                                                            setLocalFilters={
                                                                setLocalFilters
                                                            }
                                                            style={{
                                                                width: "80px",
                                                                marginLeft:
                                                                    "10px",
                                                            }}
                                                        />
                                                    </div>
                                                </FormGroup>
                                            );
                                        }
                                    )}
                                </div>
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
                            <AccordionSummary
                                sx={{ width: "320px" }}
                                component="div"
                            >
                                <div className="filter-submit">
                                    <PeachButton
                                        text="Filter"
                                        onClick={handleSubmit}
                                    />
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
            )}
            {(!width || width < 1155) && (
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

                                    {existingFilters.category ? (
                                        <div className="filter-subcategory-cont">
                                            {categories
                                                .filter(
                                                    (category) =>
                                                        category.categoryName ===
                                                        existingFilters.category
                                                )[0]
                                                .Subcategory.map(
                                                    (subcategory, index) => (
                                                        <div
                                                            className="filter-subcategory"
                                                            key={index}
                                                            onClick={() =>
                                                                addSubcategory(
                                                                    subcategory.subcategoryName
                                                                )
                                                            }
                                                            role="button"
                                                        >
                                                            {
                                                                subcategory.subcategoryName
                                                            }
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    ) : (
                                        <div className="category-filters">
                                            {categories &&
                                                categories.map(
                                                    (category, index) => (
                                                        <div
                                                            className="filter-category-cont"
                                                            key={index}
                                                        >
                                                            <div
                                                                className="filter-category"
                                                                onClick={() =>
                                                                    addCategory(
                                                                        category.categoryName
                                                                    )
                                                                }
                                                                role="button"
                                                            >
                                                                {
                                                                    category.categoryName
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="filter-section">
                                <h2 className="filter-type">Color</h2>
                                <div className="color-filters">
                                    <FormGroup>
                                        {colors.map((colorPair, index) => (
                                            <div
                                                className="checkbox-pair"
                                                key={`colorPair${index}`}
                                            >
                                                <FormControlLabel
                                                    className="color-option"
                                                    control={
                                                        <Checkbox
                                                            name="color"
                                                            value={colorPair[0]}
                                                            checked={
                                                                localFilters.color?.includes(
                                                                    colorPair[0]
                                                                ) || false
                                                            }
                                                            onChange={
                                                                handleColorChange
                                                            }
                                                        />
                                                    }
                                                    label={colorPair[0]}
                                                />
                                                {colorPair.length > 1 && (
                                                    <FormControlLabel
                                                        className="color-option"
                                                        control={
                                                            <Checkbox
                                                                name="color"
                                                                value={
                                                                    colorPair[1]
                                                                }
                                                                checked={
                                                                    localFilters.color?.includes(
                                                                        colorPair[1]
                                                                    ) || false
                                                                }
                                                                onChange={
                                                                    handleColorChange
                                                                }
                                                            />
                                                        }
                                                        label={colorPair[1]}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </FormGroup>
                                </div>
                            </div>
                            <div className="filter-section">
                                <h2 className="filter-type">Material</h2>
                                <div className="material-filters">
                                    <FormGroup>
                                        {materials.map(
                                            (materialPair, index) => (
                                                <div
                                                    className="checkbox-pair"
                                                    key={`materialPair${index}`}
                                                >
                                                    <FormControlLabel
                                                        className="material-option"
                                                        control={
                                                            <Checkbox
                                                                name="material"
                                                                value={
                                                                    materialPair[0]
                                                                }
                                                                checked={
                                                                    localFilters.material?.includes(
                                                                        materialPair[0]
                                                                    ) || false
                                                                }
                                                                onChange={
                                                                    handleMaterialChange
                                                                }
                                                            />
                                                        }
                                                        label={materialPair[0]}
                                                    />
                                                    {materialPair.length >
                                                        1 && (
                                                        <FormControlLabel
                                                            className="material-option"
                                                            control={
                                                                <Checkbox
                                                                    name="material"
                                                                    value={
                                                                        materialPair[1]
                                                                    }
                                                                    checked={
                                                                        localFilters.material?.includes(
                                                                            materialPair[1]
                                                                        ) ||
                                                                        false
                                                                    }
                                                                    onChange={
                                                                        handleMaterialChange
                                                                    }
                                                                />
                                                            }
                                                            label={
                                                                materialPair[1]
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </FormGroup>
                                </div>
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
                                        <span className="price-label">
                                            Price
                                        </span>
                                        <div className="min-max-fields">
                                            <span
                                                style={{
                                                    marginRight: "-5px",
                                                }}
                                            >
                                                $
                                            </span>
                                            <DecimalField
                                                label="min"
                                                param={`minPrice`}
                                                value={
                                                    localFilters.minPrice || ""
                                                }
                                                setLocalFilters={
                                                    setLocalFilters
                                                }
                                                style={{
                                                    width: "80px",
                                                    marginLeft: "10px",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    marginLeft: "10px",
                                                    marginRight: "-5px",
                                                }}
                                            >
                                                &ndash; $
                                            </span>
                                            <DecimalField
                                                label="max"
                                                param={`maxPrice`}
                                                value={
                                                    localFilters.maxPrice || ""
                                                }
                                                setLocalFilters={
                                                    setLocalFilters
                                                }
                                                style={{
                                                    width: "80px",
                                                    marginLeft: "10px",
                                                }}
                                            />
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>
                            <div className="filter-section">
                                <h2 className="filter-type">
                                    Dimensions (in inches)
                                </h2>
                                <div className="dimension-filters">
                                    {dimensions.map(
                                        (dimension: string, index: number) => {
                                            const minParam =
                                                `min${dimension}` as keyof Filters;
                                            const maxParam =
                                                `max${dimension}` as keyof Filters;
                                            return (
                                                <FormGroup
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                    }}
                                                    key={index}
                                                >
                                                    <p className="dimension-label">
                                                        {dimension}
                                                    </p>
                                                    <div className="min-max-fields">
                                                        <DecimalField
                                                            label="min"
                                                            param={`min${dimension}`}
                                                            value={
                                                                localFilters[
                                                                    minParam
                                                                ] || ""
                                                            }
                                                            setLocalFilters={
                                                                setLocalFilters
                                                            }
                                                            style={{
                                                                width: "80px",
                                                                marginLeft:
                                                                    "10px",
                                                            }}
                                                            // endAdornment={
                                                            //     <InputAdornment position="end">
                                                            //         in.
                                                            //     </InputAdornment>
                                                            // }
                                                        />
                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    "10px",
                                                            }}
                                                        >
                                                            &ndash;
                                                        </span>
                                                        <DecimalField
                                                            label="max"
                                                            param={`max${dimension}`}
                                                            value={
                                                                localFilters[
                                                                    maxParam
                                                                ] || ""
                                                            }
                                                            setLocalFilters={
                                                                setLocalFilters
                                                            }
                                                            style={{
                                                                width: "80px",
                                                                marginLeft:
                                                                    "10px",
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
                                        }
                                    )}
                                </div>
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
            )}
        </React.Fragment>
    );
};
export default FilterOptions;
