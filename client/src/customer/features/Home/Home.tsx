import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";

import PeachButton from "../../../common/components/PeachButton";

interface Props {}
const Home: React.FC<Props> = () => {
    const navigate = useNavigate();

    return (
        <div className="home-splash-screen">
            <div className="splash-screen-cont">
                <div className="splash-text-cont">
                    <h1>Peach Blossom</h1>
                    <p>An imaginary lifestyle brand and portfolio project.</p>
                </div>
                <div className="splash-btn-set">
                    <PeachButton
                        text="Shop"
                        onClick={() => navigate("/shop")}
                    />
                    <PeachButton
                        text="Learn More"
                        onClick={() => navigate("/about")}
                    />
                    <PeachButton
                        text="Visit Portfolio"
                        onClick={() =>
                            window.open("https://ryanyoung.codes", "_blank")
                        }
                    />
                </div>
            </div>
        </div>
    );
};
export default Home;
