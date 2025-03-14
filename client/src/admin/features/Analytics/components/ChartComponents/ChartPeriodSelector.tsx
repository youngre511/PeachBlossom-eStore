import { ArrowLeftSharp, ArrowRightSharp } from "@mui/icons-material";
import { IconButton, SvgIcon } from "@mui/material";
import React, { SetStateAction } from "react";

/**
 * @description A simple interface for choosing the currently displayed period whenever bar or pie chart data is split into multiple datasets grouped into periods.
 */

interface Props {
    currentIdx: number;
    setCurrentIdx: React.Dispatch<SetStateAction<number>>;
    maxIdx: number;
    text: string;
}
const ChartPeriodSelector: React.FC<Props> = ({
    currentIdx,
    setCurrentIdx,
    maxIdx,
    text,
}) => {
    return (
        <React.Fragment>
            <IconButton
                onClick={() => setCurrentIdx(currentIdx - 1)}
                disabled={currentIdx === 0}
                sx={{
                    width: "40px",
                    height: "40px",
                    marginRight: "8px",
                }}
            >
                <SvgIcon>
                    <ArrowLeftSharp />
                </SvgIcon>
            </IconButton>
            <div className="chart-period-selection-label">{text}</div>
            <IconButton
                onClick={() => setCurrentIdx(currentIdx + 1)}
                disabled={currentIdx === maxIdx}
                sx={{
                    width: "40px",
                    height: "40px",
                    marginLeft: "8px",
                }}
            >
                <SvgIcon>
                    <ArrowRightSharp />
                </SvgIcon>
            </IconButton>
        </React.Fragment>
    );
};
export default ChartPeriodSelector;
