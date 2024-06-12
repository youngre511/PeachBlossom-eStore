import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import axios, { AxiosError } from "axios";

interface UseAxiosReturn {
    setUrl: Dispatch<SetStateAction<string>>;
    data: any;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    error: string | null;
    setAuth: Dispatch<SetStateAction<string | null>>;
}

function useAxios(): UseAxiosReturn {
    // This holds the result of an API call
    const [data, setData] = useState<any>(null);
    // This can tell other components that the axios call is still working
    const [loading, setLoading] = useState<boolean>(false);
    // This holds the URL from a component; gives us control over when the call occurs
    const [url, setUrl] = useState<string>("");
    // This handles an error status based on the results of an axios call (failure to get wanted results)
    const [error, setError] = useState<string | null>(null);

    // OPTIONAL: Set an API key using setAuth()
    const [auth, setAuth] = useState<string | null>(null);

    async function customFetch() {
        try {
            let payload;
            if (auth) {
                console.log(`auth was used`);

                payload = await axios.get(url, {
                    headers: {
                        Authorization: auth,
                    },
                });
            } else {
                console.log(`auth was not used`);

                payload = await axios.get(url);
            }

            setData(payload.data);
            setLoading(false);
            setError(null);
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 404) {
                setError("data could not be found");
                setData(null);
                setLoading(false);
            } else {
                setError(axiosError.message);
                setData(null);
                setLoading(false);
            }
        }
    }

    // On the component side, use `setLoading(true)` to trigger this hook
    useEffect(() => {
        if (loading) {
            customFetch();
        }
    }, [loading]);

    return { setUrl, data, loading, setLoading, error, setAuth };
}

export default useAxios;
