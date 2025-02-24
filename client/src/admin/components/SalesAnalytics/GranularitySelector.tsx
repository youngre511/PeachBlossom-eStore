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
    TopParams,
    TOTParams,
} from "../../features/Analytics/analyticsTypes";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

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

    const containerRef = useRef<HTMLDivElement | null>(null);

    const [optionWidth, setOptionWidth] = useState<string>("0");
    const { width } = useWindowSizeContext();
    const [isNarrow, setIsNarrow] = useState<boolean>(true);

    useEffect(() => {
        if (width && width >= 950 && isNarrow) {
            setIsNarrow(false);
        } else if (width && width < 950 && !isNarrow) {
            setIsNarrow(true);
        }
    }, [width, setIsNarrow]);

    useEffect(() => {
        const container = containerRef.current;

        const handleScroll = () => {
            if (container) {
                container.scrollLeft = 0;
            }
        };

        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [containerRef]);

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

    useEffect(() => {
        switch (paramsObj.granularity) {
            case "all": {
                setOptionWidth("72.19px");
                break;
            }
            case "year": {
                setOptionWidth("63.81px");
                break;
            }
            case "quarter": {
                setOptionWidth("88.64px");
                break;
            }
            case "month": {
                setOptionWidth("78.73px");
                break;
            }
            case "week": {
                setOptionWidth("67.38px");
                break;
            }
            default: {
                setOptionWidth("70px");
            }
        }
    }, [paramsObj.granularity]);

    return (
        <div className="granularity-select">
            <div
                className="granularity-button-set-cont"
                ref={containerRef}
                style={
                    !isMenuOpen
                        ? {
                              // Set width to 88px if granularity is "quarter", to 76px if granularity is month, and 70px otherwise
                              width: optionWidth,
                          }
                        : undefined
                }
            >
                <div className="granularity-button-set">
                    {granularityOptions.map((granularity) => {
                        if (!isNarrow || granularity !== "week") {
                            return (
                                <div
                                    key={granularity}
                                    role="button"
                                    className="granularity-button"
                                    onClick={() => handleClick(granularity)}
                                    style={
                                        granularity === paramsObj.granularity
                                            ? {
                                                  color: "white",
                                                  position: "sticky",
                                                  right: 0,
                                              }
                                            : undefined
                                    }
                                >
                                    {`${granularity}${
                                        granularity === "all" ? " time" : "ly"
                                    }`.toUpperCase()}
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};
export default GranularitySelector;
