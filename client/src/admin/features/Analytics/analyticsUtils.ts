import axios from "axios";
import { RootState } from "../../store/store";
import {
    BarData,
    BaseParams,
    LineData,
    PieData,
    RBCParams,
    PlusParams,
    TOTParams,
} from "./analyticsTypes";
import { arraysEqual } from "../../../common/utils/arraysEqual";

export const fetchROTData = async (
    params: PlusParams,
    force: boolean,
    stateSlice: {
        rotParams: PlusParams | null;
        rotData: LineData[] | BarData[];
        expiration: number | null;
        loading: boolean;
        error: string | null;
    },
    rejectWithValue: any
) => {
    const existingParams = stateSlice.rotParams;
    let paramsUnchanged = true;
    console.log("existingParams:", existingParams);
    const keys = Object.keys(params) as Array<keyof PlusParams>;
    if (existingParams && stateSlice.rotData.length > 0) {
        for (let key of keys) {
            const currentValue = params[key];
            const existingValue = existingParams[key];
            if (Array.isArray(currentValue) && Array.isArray(existingValue)) {
                if (!arraysEqual(currentValue, existingValue)) {
                    paramsUnchanged = false;
                    break;
                }
            } else if (currentValue !== existingValue) {
                paramsUnchanged = false;
                break;
            }
        }
    } else {
        paramsUnchanged = false;
    }
    console.log("paramsUnchanged:", paramsUnchanged);

    if (
        paramsUnchanged &&
        !force &&
        (!stateSlice.expiration || Date.now() < stateSlice.expiration)
    ) {
        console.log("conditions met");
        return {
            params,
            data: stateSlice.rotData,
        };
    }

    const token = localStorage.getItem("jwtToken"); // Get the token from local storage
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/analytics/rot`,
            {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            }
        );
        return {
            params: params,
            data: response.data,
        };
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || "Error fetching revenue over time"
        );
    }
};

export const fetchRBCData = async <T>(
    params: RBCParams,
    force: boolean,
    stateSlice: {
        rbcParams: RBCParams | null;
        rbcData: T;
        stateOrRegion: string | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    },
    rejectWithValue: any
) => {
    const existingParams = stateSlice.rbcParams;
    let paramsUnchanged = true;

    const keys = Object.keys(params) as Array<keyof RBCParams>;
    if (existingParams && stateSlice.rbcData) {
        for (let key of keys) {
            const currentValue = params[key];
            const existingValue = existingParams[key];
            if (Array.isArray(currentValue) && Array.isArray(existingValue)) {
                if (!arraysEqual(currentValue, existingValue)) {
                    paramsUnchanged = false;
                    break;
                }
            } else if (currentValue !== existingValue) {
                paramsUnchanged = false;
                break;
            }
        }
    } else {
        paramsUnchanged = false;
    }

    if (
        paramsUnchanged &&
        !force &&
        (!stateSlice.expiration || Date.now() < stateSlice.expiration)
    ) {
        return {
            params,
            data: stateSlice.rbcData,
        };
    }

    const token = localStorage.getItem("jwtToken"); // Get the token from local storage
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/analytics/rbc`,
            {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            }
        );
        console.log("response data:", response.data);
        return {
            params: params,
            data: response.data,
        };
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || "Error fetching revenue by category"
        );
    }
};

export const fetchTOTData = async (
    params: TOTParams,
    force: boolean,
    stateSlice: {
        totParams: TOTParams | null;
        totData: LineData[] | BarData[];
        expiration: number | null;
        loading: boolean;
        error: string | null;
    },
    rejectWithValue: any
) => {
    const existingParams = stateSlice.totParams;
    let paramsUnchanged = true;

    const keys = Object.keys(params) as Array<keyof TOTParams>;
    if (existingParams && stateSlice.totData) {
        for (let key of keys) {
            const currentValue = params[key];
            const existingValue = existingParams[key];
            if (Array.isArray(currentValue) && Array.isArray(existingValue)) {
                if (!arraysEqual(currentValue, existingValue)) {
                    paramsUnchanged = false;
                    break;
                }
            } else if (currentValue !== existingValue) {
                paramsUnchanged = false;
                break;
            }
        }
    } else {
        paramsUnchanged = false;
    }

    if (
        paramsUnchanged &&
        !force &&
        (!stateSlice.expiration || Date.now() < stateSlice.expiration)
    ) {
        return {
            params,
            data: stateSlice.totData,
        };
    }

    const token = localStorage.getItem("jwtToken"); // Get the token from local storage
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/analytics/tot`,
            {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            }
        );
        console.log("response data:", response.data);
        return {
            params: params,
            data: response.data,
        };
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || "Error fetching transactions over time"
        );
    }
};

export const generateExpirationTime = () => {
    const expirationTime = new Date();

    expirationTime.setMinutes(expirationTime.getMinutes() + 10);
    return expirationTime.getTime();
};
