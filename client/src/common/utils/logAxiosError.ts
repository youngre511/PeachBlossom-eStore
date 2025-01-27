import { AxiosError } from "axios";

/**
 * @description A function to handle axios errors in a non-disruptive manner by simply logging to the console.
 */
export const logAxiosError = (error: any, actionDescription?: string) => {
    if (error instanceof AxiosError) {
        console.error(error.status);
        console.error(
            `${
                actionDescription
                    ? `Error ${actionDescription}`
                    : "Axios Error:"
            }: ${error.status}`
        );
        console.error(
            error.response
                ? error.response.data.message
                : `An unexpected error occurred${
                      actionDescription ? ` while ${actionDescription}` : ""
                  }.`
        );
    } else {
        console.error(error);
    }
};
