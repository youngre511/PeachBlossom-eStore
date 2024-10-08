import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Props {}
const HomeRedirect: React.FC<Props> = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/sales/dashboard");
    }, []);
    return <div></div>;
};
export default HomeRedirect;
