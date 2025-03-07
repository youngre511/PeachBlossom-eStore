import React, { useRef, useState } from "react";
import { useEffect } from "react";
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
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import SelectorButtons from "./SelectorButtons";

/**
 * @description A set of buttons for choosing the granularity of chart data.
 * In mobile, functions as an expanding menu with only the currently chosen granularity displayed when closed.
 */

interface Props<
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams,
    G extends BaseGranularity | PlusGranularity | ExpandedGranularity
> {
    paramsObj: T;
    setParams: React.Dispatch<React.SetStateAction<T>>;
    granularityOptions: G[];
}
const GranularitySelector = <
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams,
    G extends BaseGranularity | PlusGranularity | ExpandedGranularity
>({
    paramsObj,
    setParams,
    granularityOptions,
}: Props<T, G>): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);

    const { width } = useWindowSizeContext();
    const [isNarrow, setIsNarrow] = useState<boolean>(true);

    useEffect(() => {
        if (width && width >= 950 && isNarrow) {
            setIsNarrow(false);
        } else if (width && width < 950 && !isNarrow) {
            setIsNarrow(true);
        }
    }, [width, setIsNarrow]);

    const handleClick = (granularity: G) => {
        if (isMenuOpen) {
            setParams({
                ...paramsObj,
                granularity: granularity as G,
            });
        }
        if (isNarrow) {
            setIsMenuOpen(!isMenuOpen);
        }
    };

    useEffect(() => {
        if (isNarrow) {
            setIsMenuOpen(false);
            if (paramsObj.granularity === "week") {
                setParams({
                    ...paramsObj,
                    granularity: "month",
                });
            }
        } else {
            setIsMenuOpen(true);
        }
    }, [isNarrow]);

    return (
        <SelectorButtons<G>
            type="granularity"
            isNarrow={isNarrow}
            isMenuOpen={isMenuOpen}
            options={granularityOptions}
            selectedOption={paramsObj.granularity as G}
            handleClick={handleClick}
        />
    );
};
export default GranularitySelector;
