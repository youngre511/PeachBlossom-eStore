import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";

import GoldButton from "../../../common/components/GoldButton";

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
                    <GoldButton text="Shop" onClick={() => navigate("/shop")} />
                    <GoldButton
                        text="Learn More"
                        onClick={() => navigate("/about")}
                    />
                    <GoldButton
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
