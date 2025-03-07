import { CircularProgress } from "@mui/material";
import React, { ReactNode, SetStateAction } from "react";

import {
    AOVParams,
    BaseGranularity,
    ExpandedGranularity,
    PlusGranularity,
    PlusParams,
    RBCParams,
    RRPParams,
    TOTParams,
} from "../../../features/Analytics/analyticsTypes";
import ChartSelectionButtons, { ChartType } from "./ChartSelectionButtons";
import DateSelector from "./DateSelector";
import GranularitySelector from "./GranularitySelector";

/**
 * @description The frame that charts are displayed in. Includes all filter interfaces.
 *  @param className - class name to be applied to the outermost div
 *  @param title - text to be displayed in box header
 *  @param allowedTypes - an array of chart types permitted for the given chart
 *  @param loading - boolean to track whether data is being retrieved from back end
 *  @param setLoading - set state action to control loading (required only when allowedTypes length is greater than 1)
 *  @param params - filter params for the chart (params type provided in generic types)
 *  @param setParams - set state action for params
 *  @param stacked - boolean determining whether the chart includes a stacked-bar-graph option (optional arg that defaults to false)
 *  @param setStacked - set state action for stacked boolean (required only when stacked is true)
 *  @param granularityOptions - a list of valid granularities for the given chart (type provided in generic types)
 *  @param children - accepts the charts themselves as children
 */

interface ChartFrameProps<
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams,
    G extends BaseGranularity | PlusGranularity | ExpandedGranularity
> {
    className: string;
    title: string;
    allowedTypes: ChartType[];
    loading: boolean;
    setLoading?: React.Dispatch<SetStateAction<boolean>> | undefined;
    params: T;
    setParams: React.Dispatch<SetStateAction<T>>;
    stacked?: boolean;
    setStacked?: React.Dispatch<SetStateAction<boolean>>;
    granularityOptions: G[];
    children: ReactNode;
}

const ChartFrame = <
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams,
    G extends BaseGranularity | PlusGranularity | ExpandedGranularity
>({
    className,
    title,
    allowedTypes,
    loading,
    setLoading,
    params,
    setParams,
    stacked,
    setStacked,
    granularityOptions,
    children,
}: ChartFrameProps<T, G>): JSX.Element => {
    return (
        <div className={`${className} analytics-box`}>
            <div className="box-header">
                <h2>{title}</h2>
                {(allowedTypes.length > 1 || setStacked) && (
                    <ChartSelectionButtons<T>
                        setLoading={setLoading || ((boolean: boolean) => {})}
                        params={params}
                        setParams={setParams}
                        allowedTypes={allowedTypes}
                        stacked={stacked}
                        setStacked={setStacked}
                    />
                )}
            </div>
            <div
                className={`${
                    allowedTypes.includes("pie") ? "pie-chart-cont " : ""
                }chart`}
            >
                {loading && (
                    <div className="chart-loading">
                        <CircularProgress />
                    </div>
                )}
                {!loading && <React.Fragment>{children}</React.Fragment>}
            </div>
            <div className="box-footer">
                <DateSelector paramsObj={params} setParams={setParams} />
                <GranularitySelector<T, G>
                    paramsObj={params}
                    setParams={setParams}
                    granularityOptions={granularityOptions}
                />
            </div>
        </div>
    );
};
export default ChartFrame;
