import React from "react";
import { useEffect, useState } from "react";
import { RootState } from "../../store/customerStore";
import { useAppSelector } from "../../hooks/reduxHooks";
import { Filters } from "../ProductCatalog/CatalogTypes";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import MobileFilters from "./MobileFilters";
import DesktopFilters from "./DesktopFilters";

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
    handleFilterDrawerClose,
}: Props) => {
    const { width } = useWindowSizeContext();
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalog.filters
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

    const handleMaterialsChange = (
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
                <DesktopFilters
                    addCategory={addCategory}
                    addSubcategory={addSubcategory}
                    colors={colors}
                    handleColorChange={handleColorChange}
                    materials={materials}
                    handleMaterialsChange={handleMaterialsChange}
                    dimensions={dimensions}
                    setLocalFilters={setLocalFilters}
                    localFilters={localFilters}
                    handleSubmit={handleSubmit}
                    handleReset={handleReset}
                />
            )}
            {(!width || width < 1155) && (
                <MobileFilters
                    addCategory={addCategory}
                    addSubcategory={addSubcategory}
                    colors={colors}
                    handleColorChange={handleColorChange}
                    materials={materials}
                    handleMaterialsChange={handleMaterialsChange}
                    dimensions={dimensions}
                    setLocalFilters={setLocalFilters}
                    localFilters={localFilters}
                    handleSubmit={handleSubmit}
                    handleReset={handleReset}
                    handleFilterDrawerClose={handleFilterDrawerClose}
                />
            )}
        </React.Fragment>
    );
};
export default FilterOptions;
