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
} from "../../features/Analytics/analyticsTypes";

interface Props<
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams,
    G extends BaseGranularity | PlusGranularity | ExpandedGranularity
> {
    paramsObj: T;
    setParams: React.Dispatch<React.SetStateAction<T>>;
    granularityOptions: G[];
    mobile: boolean;
}
const GranularitySelector = <
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams,
    G extends BaseGranularity | PlusGranularity | ExpandedGranularity
>({
    paramsObj,
    setParams,
    granularityOptions,
    mobile,
}: Props<T, G>): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);
    const [isScrollLocked, setIsScrollLocked] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scrollPosition = useRef(0);

    useEffect(() => {
        const container = containerRef.current;

        const handleScroll = () => {
            if (container) {
                if (isScrollLocked) {
                    // Lock the horizontal scroll position by setting scrollLeft back to the saved position
                    container.scrollLeft = scrollPosition.current;
                } else {
                    // Save the current horizontal scroll position when the lock is not active
                    scrollPosition.current = container.scrollLeft;
                }
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
    }, [isScrollLocked, containerRef]);

    const handleClick = (granularity: G) => {
        if (isMenuOpen) {
            setParams({
                ...paramsObj,
                granularity: granularity as G,
            });
        }
        if (mobile) {
            if (isMenuOpen) {
                setTimeout(() => {
                    setIsScrollLocked(true);
                }, 300);
            } else {
                setIsScrollLocked(false);
            }
            setIsMenuOpen(!isMenuOpen);
        }
    };

    useEffect(() => {
        if (mobile) {
            setIsMenuOpen(false);
            setTimeout(() => {
                setIsScrollLocked(true);
            }, 300);
        } else {
            setIsScrollLocked(false);
            setIsMenuOpen(true);
        }
    }, [mobile]);

    return (
        <div className="granularity-select">
            <div
                className="granularity-button-set-cont"
                style={
                    !isMenuOpen
                        ? {
                              width: ["year", "week"].includes(
                                  paramsObj.granularity
                              )
                                  ? "70px"
                                  : "88px",
                          }
                        : undefined
                }
            >
                <div className="granularity-button-set" ref={containerRef}>
                    {granularityOptions.map((granularity) => (
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
                            {`${granularity}ly`.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default GranularitySelector;
