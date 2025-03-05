import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { Filters } from "../../ProductCatalog/CatalogTypes";

interface MaterialFiltersProps {
    materials: string[][];
    localFilters: Filters;
    handleMaterialsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const MaterialFilters: React.FC<MaterialFiltersProps> = ({
    materials,
    localFilters,
    handleMaterialsChange,
}) => {
    return (
        <div className="material-filters">
            <FormGroup>
                {materials.map((materialPair, index) => (
                    <div className="checkbox-pair" key={`materialPair${index}`}>
                        <FormControlLabel
                            className="material-option"
                            control={
                                <Checkbox
                                    name="material"
                                    value={materialPair[0]}
                                    checked={
                                        localFilters.material?.includes(
                                            materialPair[0]
                                        ) || false
                                    }
                                    onChange={handleMaterialsChange}
                                />
                            }
                            label={materialPair[0]}
                        />
                        {materialPair.length > 1 && (
                            <FormControlLabel
                                className="material-option"
                                control={
                                    <Checkbox
                                        name="material"
                                        value={materialPair[1]}
                                        checked={
                                            localFilters.material?.includes(
                                                materialPair[1]
                                            ) || false
                                        }
                                        onChange={handleMaterialsChange}
                                    />
                                }
                                label={materialPair[1]}
                            />
                        )}
                    </div>
                ))}
            </FormGroup>
        </div>
    );
};
export default MaterialFilters;
