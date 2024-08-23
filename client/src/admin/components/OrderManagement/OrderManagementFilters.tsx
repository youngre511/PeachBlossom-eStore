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
    Box,
    Icon,
} from "@mui/material";
import SearchField from "../../../common/components/Fields/SearchField";
import { SelectFieldNonFormik } from "../../../common/components/Fields/SelectFieldNonFormik";
import FilterAltSharpIcon from "@mui/icons-material/FilterAltSharp";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

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
    "& .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary": {
        backgroundColor: "white",
    },
    "& .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.Mui-focused":
        {
            color: "rgba(0, 0, 0, 0.63)",
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
    const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
    const { width } = useWindowSizeContext();

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
        <div className="om-search-and-filters">
            <div className="om-search-bar">
                <SearchField
                    updateSearchParams={updateSearchParams}
                    sx={{ ...inputStyle }}
                    options={[]}
                />
            </div>
            <button
                className="om-filter-button"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
                <Icon sx={{ marginRight: "5px" }}>
                    <FilterAltSharpIcon />
                </Icon>
                Filter
            </button>
            <div
                className={
                    width && width < 600 ? "om-filters-mobile" : "om-filters"
                }
                style={
                    width && width < 600 && !filtersExpanded
                        ? { height: 0 }
                        : undefined
                }
            >
                <div className="om-orderStatus-select">
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
                        sx={inputStyle}
                    />
                </div>
                <div className="region-select">
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
                        sx={inputStyle}
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
                            sx={{
                                ...inputStyle,
                                width: { xs: "100%" },
                            }}
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
                            sx={{
                                ...inputStyle,
                                width: { xs: "100%" },
                            }}
                        />
                    </LocalizationProvider>
                </div>
            </div>
        </div>
    );
};
export default OrderManagementFilters;
