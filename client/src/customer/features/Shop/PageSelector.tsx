import React, { useEffect, useState } from "react";
import "./page-selector.css";

interface Props {
    numberOfResults: number;
    currentPage: number;
    itemsPerPage: number;
    updateSearchParams: (newFilters: Record<string, string>) => void;
}
const PageSelector: React.FC<Props> = ({
    numberOfResults,
    currentPage,
    itemsPerPage,
    updateSearchParams,
}) => {
    const totalPages = Math.ceil(numberOfResults / itemsPerPage);
    const [selectedPage, setSelectedPage] = useState<number>(currentPage);

    useEffect(() => {
        if (currentPage !== selectedPage) {
            setSelectedPage(currentPage);
        }
    }, [currentPage]);

    const handleNext = () => {
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setSelectedPage(newPage);
            updateSearchParams({ page: String(newPage) });
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setSelectedPage(newPage);
            updateSearchParams({ page: String(newPage) });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const handlePageSelect = (newPage: number) => {
        setSelectedPage(newPage);
        updateSearchParams({ page: String(newPage) });
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="page-selector">
            <button
                onClick={handlePrevious}
                className={`prev-page${
                    currentPage > 1 ? "" : " disabled-page-btn"
                }`}
            >
                Previous
            </button>
            {Array.from(Array(totalPages)).map((item, index) => (
                <button
                    className={`page-button${
                        selectedPage === index + 1 ? " selected-page" : ""
                    }`}
                    onClick={() => handlePageSelect(index + 1)}
                    key={`page${index}`}
                >
                    {index + 1}
                </button>
            ))}
            <button
                className={`next-page${
                    currentPage < totalPages ? "" : " disabled-page-btn"
                }`}
                onClick={handleNext}
            >
                Next
            </button>
        </div>
    );
};
export default PageSelector;
