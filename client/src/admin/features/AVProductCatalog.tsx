import React from "react";
import { useEffect } from "react";
import { useAppSelector } from "../hooks/reduxHooks";
import { RootState } from "../store/store";

interface AVCatProps {
    page: number;
    results: number;
}
const AVProductCatalog: React.FC<AVCatProps> = () => {
    const { products, numberOfResults, loading, error } = useAppSelector(
        (state: RootState) => state.avCatalog
    );
    return <div>ProductCatalog</div>;
};
export default AVProductCatalog;
