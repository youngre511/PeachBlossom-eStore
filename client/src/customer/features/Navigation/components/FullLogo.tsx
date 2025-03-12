import React from "react";
import pblogo1x from "../../../../assets/peachblossomlogo-1x.webp";
import pblogo2x from "../../../../assets/peachblossomlogo-2x.webp";
import pblogo3x from "../../../../assets/peachblossomlogo-3x.webp";
import { useNavigate } from "react-router-dom";

interface FullLogoProps {
    mobile: boolean;
}
const FullLogo: React.FC<FullLogoProps> = ({ mobile }) => {
    const navigate = useNavigate();
    return (
        <div className={`${mobile ? "m-full-logo" : "nav-logo"}`}>
            <div className={`${mobile ? "m-" : ""}border-under`}></div>
            <div className={`${mobile ? "m-" : ""}border-over`}></div>
            <img
                src={pblogo3x}
                srcSet={`${pblogo1x} 1x, ${pblogo2x} 2x, ${pblogo3x} 3x`}
                alt="peach blossom logo"
                width="158px"
                height="158px"
            />
            <div className="logo-clickable" onClick={() => navigate("/")}></div>
        </div>
    );
};
export default FullLogo;
