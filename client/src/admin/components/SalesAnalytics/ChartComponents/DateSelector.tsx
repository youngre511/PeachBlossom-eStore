import React, { useState } from "react";
import { useEffect } from "react";
import {
    AOVParams,
    PlusParams,
    RBCParams,
    RRPParams,
    TOTParams,
} from "../../../features/Analytics/analyticsTypes";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { IconButton, SvgIcon } from "@mui/material";
import DateRangeSharpIcon from "@mui/icons-material/DateRangeSharp";
import dayjs from "dayjs";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

/**
 * @description A pair of datepicker components to set the starting and ending dates of chart data filters.
 */

interface Props<
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams
> {
    paramsObj: T;
    setParams: React.Dispatch<React.SetStateAction<T>>;
}
const DateSelector = <
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams
>({
    paramsObj,
    setParams,
}: Props<T>): JSX.Element => {
    const [pickDates, setPickDates] = useState<boolean>(false);
    const { width } = useWindowSizeContext();
    const [isNarrow, setIsNarrow] = useState<boolean>(true);

    useEffect(() => {
        if (width && width >= 950 && isNarrow) {
            setIsNarrow(false);
            setPickDates(true);
        } else if (width && width < 950 && !isNarrow) {
            setIsNarrow(true);
            setPickDates(false);
        }
    }, [width]);

    return (
        <div
            className="date-picker"
            style={
                isNarrow
                    ? pickDates
                        ? { zIndex: 1 }
                        : { width: "40px" }
                    : undefined
            }
        >
            <div className="select-dates-btn">
                <IconButton onClick={() => setPickDates(!pickDates)}>
                    <SvgIcon htmlColor="white">
                        <DateRangeSharpIcon />
                    </SvgIcon>
                </IconButton>
            </div>
            <div className="date-pickers-cont">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Start Date"
                        minDate={dayjs("1-1-22")}
                        maxDate={
                            paramsObj.endDate
                                ? dayjs(paramsObj.endDate)
                                : dayjs()
                        }
                        value={
                            paramsObj.startDate
                                ? dayjs(paramsObj.startDate)
                                : dayjs("1-1-22")
                        }
                        slotProps={{
                            actionBar: {
                                actions: paramsObj.startDate
                                    ? ["clear", "accept"]
                                    : ["cancel", "accept"],
                            },
                            // field: { clearable: true },
                        }}
                        onAccept={(newValue) => {
                            setParams({
                                ...paramsObj,
                                startDate:
                                    newValue &&
                                    newValue.toISOString().substring(0, 10) !==
                                        "2022-01-01"
                                        ? newValue
                                              .toISOString()
                                              .substring(0, 10)
                                        : undefined,
                            });
                        }}
                    />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="End Date"
                        minDate={
                            paramsObj.startDate
                                ? dayjs(paramsObj.startDate)
                                : dayjs("1-2-22")
                        }
                        maxDate={dayjs()}
                        value={
                            paramsObj.endDate
                                ? dayjs(paramsObj.endDate)
                                : dayjs()
                        }
                        slotProps={{
                            actionBar: {
                                actions: paramsObj.endDate
                                    ? ["clear", "accept"]
                                    : ["cancel", "accept"],
                            },
                            // field: { clearable: true },
                        }}
                        onAccept={(newValue) => {
                            setParams({
                                ...paramsObj,
                                endDate:
                                    newValue &&
                                    newValue.toISOString().substring(0, 10) !==
                                        dayjs().toISOString().substring(0, 10)
                                        ? newValue
                                              .toISOString()
                                              .substring(0, 10)
                                        : undefined,
                            });
                        }}
                    />
                </LocalizationProvider>
            </div>
        </div>
    );
};
export default DateSelector;
