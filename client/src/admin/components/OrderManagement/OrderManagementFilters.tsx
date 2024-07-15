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
} from "@mui/material";
import SearchField from "../../../common/components/Fields/SearchField";
import { SelectFieldNonFormik } from "../../../common/components/Fields/SelectFieldNonFormik";

const inputStyle = {
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
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
        const updateParams: Record<string, string> = {
            earliestOrderDate: String(dateMin),
            latestOrderDate: String(dateMax),
            orderStatus: orderStatus.length > 0 ? orderStatus.join(",") : "",
            state: st,
        };
        updateSearchParams(updateParams);
    }, [dateMin, dateMax, orderStatus, region, state]);

    return (
        <div className="search-and-filters">
            <div className="om-filters">
                <div className="orderStatus-select">
                    <SelectFieldNonFormik
                        label="Order Status"
                        name={"orderStatus"}
                        value={orderStatus}
                        multiple={true}
                        variant="outlined"
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
                        sx={{ inputStyle }}
                    />
                </div>
                <div className="region-select" style={{ width: "200px" }}>
                    <SelectFieldNonFormik
                        value={region}
                        variant="outlined"
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
                    />
                </div>
                <div className="state-select">
                    <SelectFieldNonFormik
                        value={state}
                        variant="outlined"
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
                        />
                    </LocalizationProvider>
                </div>
            </div>

            <div className="search-bar">
                <SearchField
                    updateSearchParams={updateSearchParams}
                    sx={inputStyle}
                    inputSx={{ backgroundColor: "white" }}
                    options={[]}
                />
            </div>
        </div>
    );
};
export default OrderManagementFilters;
