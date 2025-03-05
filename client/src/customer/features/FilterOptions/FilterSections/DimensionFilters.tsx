import React, { SetStateAction } from "react";
import { useEffect } from "react";
import MinMaxFields from "./MinMaxFields";
import { FormGroup } from "@mui/material";
import { Filters } from "../../ProductCatalog/CatalogTypes";

type StringOnlyFilterKeys = {
    [K in keyof Filters]: Filters[K] extends string | null ? K : never;
}[keyof Filters];

interface DimensionFiltersProps {
    dimensions: string[];
    setLocalFilters: React.Dispatch<SetStateAction<Filters>>;
    localFilters: Filters;
}
const DimensionFilters: React.FC<DimensionFiltersProps> = ({
    dimensions,
    setLocalFilters,
    localFilters,
}) => {
    return (
        <div className="dimension-filters">
            {dimensions.map((dimension: string, index: number) => {
                const minParam = `min${dimension}` as StringOnlyFilterKeys;
                const maxParam = `max${dimension}` as StringOnlyFilterKeys;
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

                        <MinMaxFields
                            param={dimension}
                            setLocalFilters={setLocalFilters}
                            minValue={localFilters[minParam] || ""}
                            maxValue={localFilters[maxParam] || ""}
                        />
                    </FormGroup>
                );
            })}
        </div>
    );
};
export default DimensionFilters;
