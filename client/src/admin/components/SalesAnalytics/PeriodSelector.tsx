import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { Period, TopParams } from "../../features/Analytics/analyticsTypes";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props<T extends TopParams> {
    paramsObj: T;
    setParams: React.Dispatch<React.SetStateAction<T>>;
    periodOptions: string[];
}
const PeriodSelector = <T extends TopParams>({
    paramsObj,
    setParams,
    periodOptions,
}: Props<T>): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const [optionWidth, setOptionWidth] = useState<string>("0");
    const { width } = useWindowSizeContext();
    const [isNarrow, setIsNarrow] = useState<boolean>(true);

    const periodDict: Record<string, Period> = {
        "7d": "7d",
        "30d": "30d",
        "6m": "6m",
        "1y": "1y",
        "all time": "allTime",
    };

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

    useEffect(() => {
        switch (paramsObj.period) {
            case "allTime": {
                setOptionWidth("72.19px");
                break;
            }
            default: {
                setOptionWidth("70px");
            }
        }
    }, [paramsObj.period]);

    const handleClick = (period: Period) => {
        if (isMenuOpen) {
            setParams({
                ...paramsObj,
                period: period,
            });
        }
        if (isNarrow) {
            setIsMenuOpen(!isMenuOpen);
        }
    };

    useEffect(() => {
        if (isNarrow) {
            setIsMenuOpen(false);
        } else {
            setIsMenuOpen(true);
        }
    }, [isNarrow]);

    return (
        <div className="period-select">
            <div
                className="period-button-set-cont"
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
                <div className="period-button-set">
                    {periodOptions.map((period) => {
                        return (
                            <div
                                key={period}
                                role="button"
                                className="period-button"
                                onClick={() => handleClick(periodDict[period])}
                                style={
                                    periodDict[period] === paramsObj.period
                                        ? {
                                              color: "white",
                                              position: "sticky",
                                              right: 0,
                                          }
                                        : undefined
                                }
                            >
                                {`${period}`.toUpperCase()}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default PeriodSelector;
