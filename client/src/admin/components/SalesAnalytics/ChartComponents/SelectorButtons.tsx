import React, { useRef, useState } from "react";
import { useEffect } from "react";
import {
    BaseGranularity,
    ExpandedGranularity,
    Period,
    PlusGranularity,
} from "../../../features/Analytics/analyticsTypes";

/**
 * @description A generic selector-button template for the buttons at the bottom-right of a chart frame.
 * Works for either period selection or granularity selection (specified in "type" argument). Buttons are generated from a provided list of options.
 */

interface SelectorButtonsProps<
    T extends BaseGranularity | PlusGranularity | ExpandedGranularity | Period
> {
    type: "period" | "granularity";
    isNarrow: boolean;
    isMenuOpen: boolean;
    options: T[];
    selectedOption: T;
    handleClick: (option: T) => void;
}
const SelectorButtons = <
    T extends BaseGranularity | PlusGranularity | ExpandedGranularity | Period
>({
    type,
    isNarrow,
    isMenuOpen,
    options,
    selectedOption,
    handleClick,
}: SelectorButtonsProps<T>): JSX.Element => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const selectedRef = useRef<HTMLDivElement | null>(null);

    const [optionWidth, setOptionWidth] = useState<string>("0");

    // Dictionary for converting granularity or period params to their display versions.
    const nameDict: Record<
        BaseGranularity | PlusGranularity | ExpandedGranularity | Period,
        string
    > = {
        week: "weekly",
        month: "monthly",
        quarter: "quarterly",
        year: "yearly",
        all: "all time",
        "7d": "7d",
        "30d": "30d",
        "6m": "6m",
        "1y": "1y",
        allTime: "all time",
    };

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
        if (selectedRef.current) {
            const width = Math.round(
                selectedRef.current.getBoundingClientRect().width
            );
            setOptionWidth(`${width}px`);
        }
    }, [selectedOption]);

    return (
        <div className={`${type}-select`}>
            <div
                className={`${type}-button-set-cont`}
                ref={containerRef}
                style={
                    !isMenuOpen
                        ? {
                              width: optionWidth,
                          }
                        : undefined
                }
            >
                <div className={`${type}-button-set`}>
                    {options.map((option) => {
                        if (!isNarrow || option !== "week") {
                            return (
                                <div
                                    key={option}
                                    role="button"
                                    className={`${type}-button`}
                                    ref={
                                        option === selectedOption
                                            ? selectedRef
                                            : null
                                    }
                                    onClick={() => handleClick(option)}
                                    style={
                                        option === selectedOption
                                            ? {
                                                  color: "white",
                                                  position: "sticky",
                                                  right: 0,
                                                  top: 0,
                                                  bottom: 0,
                                              }
                                            : undefined
                                    }
                                >
                                    {nameDict[option].toUpperCase()}
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};
export default SelectorButtons;
