const buildDateRange = (
    startDate: string | null,
    endDate: string | null
): Record<string, any> => {
    const startDateObj = startDate
        ? new Date(startDate)
        : new Date("01-01-2022");
    const endDateObj = endDate ? new Date(endDate) : new Date();

    return {
        startDate: startDateObj.toISOString().split("T")[0],
        endDate: endDateObj.toISOString().split("T")[0],
    };
};

export default buildDateRange;
