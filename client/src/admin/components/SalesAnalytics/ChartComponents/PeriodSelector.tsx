import React, { useState } from "react";
import { useEffect } from "react";
import { Period, TopParams } from "../../../features/Analytics/analyticsTypes";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import SelectorButtons from "./SelectorButtons";

/**
 * @description A set of buttons for choosing how long before today the starting date for the dataset is.
 * (The ending date is always today.)
 */

interface Props<T extends TopParams> {
    paramsObj: T;
    setParams: React.Dispatch<React.SetStateAction<T>>;
    periodOptions: Period[];
}
const PeriodSelector = <T extends TopParams>({
    paramsObj,
    setParams,
    periodOptions,
}: Props<T>): JSX.Element => {
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
        <SelectorButtons<Period>
            type="period"
            isNarrow
            isMenuOpen={isMenuOpen}
            options={periodOptions}
            selectedOption={paramsObj.period}
            handleClick={handleClick}
        />
    );
};
export default PeriodSelector;
