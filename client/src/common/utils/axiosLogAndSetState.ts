import { AxiosError } from "axios";
import { SetStateAction } from "react";
import { logAxiosError } from "./logAxiosError";

/**
 * @description A function to handle axios errors and set error messages
 */
export const axiosLogAndSetState = (
    error: any,
    setErrorMsgState: React.Dispatch<SetStateAction<string | null>>,
    actionDescription?: string
) => {
    logAxiosError(error, actionDescription);
    if (error instanceof AxiosError) {
        setErrorMsgState(
            error.response
                ? error.response.data.message
                : `An unexpected error occurred${
                      actionDescription ? ` while ${actionDescription}` : ""
                  }.`
        );
    } else {
        setErrorMsgState(
            `An unexpected error occurred${
                actionDescription ? ` while ${actionDescription}` : ""
            }.`
        );
    }
};
