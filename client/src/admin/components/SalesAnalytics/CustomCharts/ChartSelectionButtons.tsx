import React, { SetStateAction } from "react";
import { useEffect } from "react";
import ShowChartSharpIcon from "@mui/icons-material/ShowChartSharp";
import { IconButton, SvgIcon } from "@mui/material";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import StackedBarChartSharpIcon from "@mui/icons-material/StackedBarChartSharp";
import {
    AOVParams,
    PlusParams,
    RBCParams,
    RRPParams,
    TOTParams,
} from "../../../features/Analytics/analyticsTypes";

interface ChartSelectionButtonsProps<
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams
> {
    params: T;
    setParams: React.Dispatch<SetStateAction<T>>;
    setLoading:
        | React.Dispatch<SetStateAction<boolean>>
        | ((boolean: boolean) => void);
    allowedTypes: ChartType[];
    stacked?: boolean;
    setStacked?: React.Dispatch<SetStateAction<boolean>>;
}

export type ChartType = "bar" | "line" | "pie";

const ChartSelectionButtons = <
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams
>({
    params,
    setParams,
    setLoading,
    allowedTypes,
    stacked = false,
    setStacked,
}: ChartSelectionButtonsProps<T>): JSX.Element => {
    return (
        <div className="chart-selection-btns">
            {allowedTypes.includes("line") && (
                <IconButton
                    onClick={() => {
                        setLoading(true);
                        setParams({
                            ...params,
                            chartType: "line",
                        });
                    }}
                >
                    <SvgIcon
                        htmlColor={
                            params.chartType === "line" ? "white" : undefined
                        }
                    >
                        <ShowChartSharpIcon />
                    </SvgIcon>
                </IconButton>
            )}
            {allowedTypes.includes("bar") && (
                <React.Fragment>
                    <IconButton
                        onClick={() => {
                            setLoading(true);
                            setParams({
                                ...params,
                                chartType: "bar",
                            });
                        }}
                    >
                        <SvgIcon
                            htmlColor={
                                params.chartType === "bar" && !stacked
                                    ? "white"
                                    : undefined
                            }
                        >
                            <BarChartSharpIcon />
                        </SvgIcon>
                    </IconButton>
                    {setStacked && (
                        <IconButton
                            onClick={() => {
                                setStacked(true);
                            }}
                        >
                            <SvgIcon htmlColor={stacked ? "white" : undefined}>
                                <StackedBarChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                    )}
                </React.Fragment>
            )}
        </div>
    );
};
export default ChartSelectionButtons;
