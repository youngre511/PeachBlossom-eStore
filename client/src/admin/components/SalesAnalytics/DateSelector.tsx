import React, { useState } from "react";
import { useEffect } from "react";
import {
    AOVParams,
    PlusParams,
    RBCParams,
    RRPParams,
    TOTParams,
} from "../../features/Analytics/analyticsTypes";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { IconButton, SvgIcon } from "@mui/material";
import DateRangeSharpIcon from "@mui/icons-material/DateRangeSharp";
import dayjs from "dayjs";

interface Props<
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams
> {
    paramsObj: T;
    setParams: React.Dispatch<React.SetStateAction<T>>;
    mobile: boolean;
}
const DateSelector = <
    T extends TOTParams | PlusParams | RBCParams | AOVParams | RRPParams
>({
    paramsObj,
    setParams,
    mobile,
}: Props<T>): JSX.Element => {
    const [pickDates, setPickDates] = useState<boolean>(false);

    const style = {
        "& .MuiInputBase-root.MuiOutlinedInput-root": {
            backgroundColor: "white",
        },
        scale: 0.75,
    };

    return (
        <div
            className="date-picker"
            style={
                mobile
                    ? pickDates
                        ? { zIndex: 1 }
                        : { width: "40px" }
                    : undefined
            }
        >
            <IconButton onClick={() => setPickDates(!pickDates)}>
                <SvgIcon htmlColor="white">
                    <DateRangeSharpIcon />
                </SvgIcon>
            </IconButton>
            <div className="date-pickers-cont">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Start Date"
                        sx={style}
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
                            field: { clearable: true },
                        }}
                        onAccept={(newValue) => {
                            const newDate = new Date(String(newValue));
                            setParams({
                                ...paramsObj,
                                startDate:
                                    String(newValue) !== String(dayjs("1-1-22"))
                                        ? newDate
                                        : undefined,
                            });
                        }}
                    />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="End Date"
                        sx={style}
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
                            field: { clearable: true },
                        }}
                        onAccept={(newValue) => {
                            const newDate = new Date(String(newValue));
                            setParams({
                                ...paramsObj,
                                endDate:
                                    String(newValue) !== String(dayjs())
                                        ? newDate
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
