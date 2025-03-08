import React, { FormEvent, SetStateAction, useState } from "react";
import { useEffect } from "react";
import PeachButton from "../../../../../common/components/PeachButton";

interface ChangeUserDataProps {
    children: React.ReactNode;
    dataType: string;
    clearData: () => void;
    saveData: (e: FormEvent<HTMLFormElement>) => void;
    openHeight: string;
    changing: boolean;
    setChanging: React.Dispatch<SetStateAction<boolean>>;
    errorMsg: string | null;
}
const ChangeUserData: React.FC<ChangeUserDataProps> = ({
    children,
    dataType,
    clearData,
    saveData,
    openHeight,
    changing,
    setChanging,
    errorMsg,
}) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        saveData(e);
    };

    useEffect(() => {
        console.log(changing);
    }, [changing]);
    return (
        <div
            className={`change-element`}
            style={
                changing
                    ? {
                          height: openHeight,
                      }
                    : undefined
            }
        >
            <div
                className="change-data-contents"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: openHeight,
                    width: "100%",
                    position: "relative",
                    padding: "5px 0",
                }}
            >
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: changing ? "flex" : "none",
                        flexDirection: "column",
                        alignItems: "stretch",
                        justifyContent: changing ? "space-between" : "center",
                        height: openHeight,
                        opacity: changing ? 1 : 0,
                        width: "100%",
                        padding: "10px 5px",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                >
                    {children}
                    {errorMsg && (
                        <div className="change-data-error">{errorMsg}</div>
                    )}
                    <div
                        className="save-cancel-btns"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px",
                        }}
                    >
                        <PeachButton
                            text="save"
                            onClick={() => {
                                setChanging(false);
                            }}
                            type="submit"
                            width="100%"
                        />
                        <PeachButton
                            text="cancel"
                            onClick={() => {
                                clearData();
                                setChanging(false);
                            }}
                            width="100%"
                        />
                    </div>
                </form>
                <div
                    style={{
                        width: "100%",
                        display: changing ? "none" : undefined,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        padding: "10px 5px 0 5px",
                    }}
                >
                    <PeachButton
                        text={`change ${dataType}`}
                        onClick={() => setChanging(true)}
                        width="100%"
                    />
                </div>
            </div>
        </div>
    );
};
export default ChangeUserData;
