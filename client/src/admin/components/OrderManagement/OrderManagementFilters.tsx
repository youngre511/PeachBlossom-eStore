import React from "react";
import { useState, useEffect } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
    Select,
    SvgIcon,
    InputLabel,
    MenuItem,
    SelectChangeEvent,
    styled,
    IconButton,
} from "@mui/material";
import SearchField from "../../../common/components/Fields/SearchField";
import { SelectFieldNonFormik } from "../../../common/components/Fields/SelectFieldNonFormik";
import { EditCalendarSharp } from "@mui/icons-material";

const inputStyle = {
    // backgroundColor: "white",
    "&.MuiFilledInput-root": {
        backgroundColor: "white",
        "&.Mui-disabled": {
            backgroundColor: "peach.light",
        },
    },
    "&.MuiFilledInput-input": {
        backgroundColor: "white",
    },
    "&.MuiInputBase-root": {
        backgroundColor: "white",
        "&.MuiFilledInput-root": {
            backgroundColor: "white",
            "&.Mui-disabled": {
                backgroundColor: "peach.light",
            },
        },
    },
    "& .MuiInputBase-input.MuiFilledInput-input:focus": {
        backgroundColor: "white",
    },
    "& .MuiInputBase-root.MuiFilledInput-root.MuiFilledInput-underline.MuiInputBase-adornedStart":
        {
            backgroundColor: "white",
        },
    "& .MuiInputBase-root.MuiFilledInput-root.MuiFilledInput-underline.MuiInputBase-adornedEnd":
        {
            backgroundColor: "white",
        },
    "& .MuiInputBase-root.MuiFilledInput-root": {
        backgroundColor: "white",
    },
};

const stateAbbreviations = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
];

type RegionMap = {
    [key: string]: string[];
};

const regions: RegionMap = {
    Northeast: ["CT", "ME", "MA", "NH", "RI", "VT", "NJ", "NY", "PA"],
    Southeast: [
        "AL",
        "AR",
        "FL",
        "GA",
        "KY",
        "LA",
        "MS",
        "NC",
        "SC",
        "TN",
        "VA",
        "WV",
    ],
    Midwest: ["IL", "IN", "IA", "MI", "MN", "MO", "NE", "ND", "SD", "OH", "WI"],
    Southwest: ["AZ", "NM", "OK", "TX"],
    West: ["AK", "CA", "CO", "HI", "ID", "MT", "NV", "OR", "UT", "WA", "WY"],
};

interface Props {
    updateSearchParams: (newFilters: Record<string, string>) => void;
}
const OrderManagementFilters: React.FC<Props> = ({ updateSearchParams }) => {
    const [dateMin, setDateMin] = useState<Dayjs | null>(null);
    const [dateMax, setDateMax] = useState<Dayjs | null>(null);
    const [orderStatus, setOrderStatus] = useState<string[]>([]);
    const [region, setRegion] = useState<string>("");
    const [state, setState] = useState<string[]>([]);

    useEffect(() => {
        let st: string;
        if (region && region !== "All") {
            st = regions[region].join(",");
        } else if (state.length > 0) {
            st = state.join(",");
        } else {
            st = "";
        }
        const startDate = dateMin ? dateMin.format("YYYY-MM-DD") : "";
        const endDate = dateMax ? dateMax.format("YYYY-MM-DD") : "";
        const updateParams: Record<string, string> = {
            startDate: startDate,
            endDate: endDate,
            orderStatus:
                orderStatus.length > 0
                    ? orderStatus.join(",").toLowerCase()
                    : "",
            state: st,
        };
        console.log(updateParams);
        updateSearchParams(updateParams);
    }, [dateMin, dateMax, orderStatus, region, state]);

    // useEffect(() => {
    //     if (cleared) {
    //       const timeout = setTimeout(() => {
    //         setCleared(false);
    //       }, 1500);

    //       return () => clearTimeout(timeout);
    //     }
    //     return () => {};
    //   }, [cleared]);

    return (
        <div className="search-and-filters">
            <div className="om-filters">
                <div className="orderStatus-select">
                    <SelectFieldNonFormik
                        label="Order Status"
                        name={"orderStatus"}
                        value={orderStatus}
                        multiple={true}
                        variant="filled"
                        options={[
                            "In Process",
                            "Cancelled",
                            "Ready to Ship",
                            "Shipped",
                            "Delivered",
                            "Back Ordered",
                        ]}
                        setMultipleAction={setOrderStatus}
                        readOnly={false}
                        required={false}
                        sx={inputStyle}
                    />
                </div>
                <div className="region-select" style={{ width: "200px" }}>
                    <SelectFieldNonFormik
                        value={region}
                        variant="filled"
                        label="Region"
                        name="region"
                        multiple={false}
                        setAction={setRegion}
                        required={false}
                        readOnly={false}
                        options={[
                            "All",
                            "Northeast",
                            "Southeast",
                            "Midwest",
                            "Southwest",
                            "West",
                        ]}
                        sx={inputStyle}
                    />
                </div>
                <div className="state-select">
                    <SelectFieldNonFormik
                        value={state}
                        variant="filled"
                        label="State"
                        name="state"
                        options={
                            region && region !== "All"
                                ? "disabled"
                                : stateAbbreviations
                        }
                        setMultipleAction={setState}
                        required={false}
                        multiple={true}
                        readOnly={false}
                        sx={inputStyle}
                    />
                </div>
                <div className="start-date-select">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            value={dateMin}
                            label="Start Date"
                            onChange={(newValue) => setDateMin(newValue)}
                            disableFuture={true}
                            minDate={dayjs("2024-06-01")}
                            maxDate={dateMax ? dateMax : dayjs()}
                            slotProps={{
                                actionBar: {
                                    actions: dateMax
                                        ? ["clear", "accept"]
                                        : ["cancel", "accept"],
                                },
                                field: { clearable: true },
                            }}
                            sx={{ backgroundColor: "white" }}
                        />
                    </LocalizationProvider>
                </div>
                <div className="end-date-select">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            value={dateMax}
                            label="End Date"
                            onChange={(newValue) => setDateMax(newValue)}
                            disableFuture={true}
                            minDate={dateMin ? dateMin : dayjs("2024-06-01")}
                            maxDate={dayjs()}
                            slotProps={{
                                actionBar: {
                                    actions: dateMax
                                        ? ["clear", "accept"]
                                        : ["cancel", "accept"],
                                },
                                field: { clearable: true },
                            }}
                            sx={{ backgroundColor: "white" }}
                        />
                    </LocalizationProvider>
                </div>
            </div>

            <div className="search-bar">
                <SearchField
                    updateSearchParams={updateSearchParams}
                    sx={inputStyle}
                    // inputSx={{ backgroundColor: "white" }}
                    options={[]}
                />
            </div>
        </div>
    );
};
export default OrderManagementFilters;
