import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { Filters } from "../../Shop/CatalogTypes";

interface ColorFiltersProps {
    colors: string[][];
    localFilters: Filters;
    handleColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const ColorFilters: React.FC<ColorFiltersProps> = ({
    colors,
    localFilters,
    handleColorChange,
}) => {
    return (
        <div className="color-filters">
            <FormGroup>
                {colors.map((colorPair, index) => (
                    <div className="checkbox-pair" key={`colorPair${index}`}>
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
                                    onChange={handleColorChange}
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
                                        value={colorPair[1]}
                                        checked={
                                            localFilters.color?.includes(
                                                colorPair[1]
                                            ) || false
                                        }
                                        onChange={handleColorChange}
                                    />
                                }
                                label={colorPair[1]}
                            />
                        )}
                    </div>
                ))}
            </FormGroup>
        </div>
    );
};
export default ColorFilters;
