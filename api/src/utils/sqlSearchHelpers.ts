export const calculatePagination = (page: number, itemsPerPage: number) => {
    const currentPage = Math.max(page || 1, 1);
    const offset = (currentPage - 1) * Math.max(itemsPerPage || 10, 1);
    return { page, offset };
};
