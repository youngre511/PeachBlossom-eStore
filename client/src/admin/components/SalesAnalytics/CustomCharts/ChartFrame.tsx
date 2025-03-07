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
import DateSelector from "../DateSelector";
import GranularitySelector from "../GranularitySelector";

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
