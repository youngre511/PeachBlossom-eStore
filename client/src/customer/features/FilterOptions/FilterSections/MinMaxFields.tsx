import React, { SetStateAction } from "react";
import { useEffect } from "react";
import DecimalField from "../../../../common/components/Fields/DecimalField";
import { Filters } from "../../Shop/CatalogTypes";

interface MinMaxFieldsProps {
    prefix?: string;
    minValue: string;
    maxValue: string;
    setLocalFilters: React.Dispatch<SetStateAction<Filters>>;
    formatFunction?: (value: string) => string;
    param: string;
}

const MinMaxFields: React.FC<MinMaxFieldsProps> = ({
    prefix,
    minValue,
    maxValue,
    setLocalFilters,
    formatFunction,
    param,
}) => {
    const name = param[0].toUpperCase() + param.slice(1).toLowerCase();

    return (
        <div className="min-max-fields">
            {prefix && (
                <span
                    style={{
                        marginRight: "-5px",
                    }}
                >
                    {prefix}
                </span>
            )}
            <DecimalField
                label="min"
                param={`min${name}`}
                value={minValue}
                setLocalFilters={setLocalFilters}
                formatFunction={formatFunction}
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
                &ndash;{prefix ? prefix : ""}
            </span>
            <DecimalField
                label="max"
                param={`max${name}`}
                value={maxValue}
                setLocalFilters={setLocalFilters}
                formatFunction={formatFunction}
                style={{
                    width: "80px",
                    marginLeft: "10px",
                }}
            />
        </div>
    );
};
export default MinMaxFields;
