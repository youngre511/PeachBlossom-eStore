import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import keySort from "../../utils/keySort";
import { useEffect } from "react";
import { nivoTheme } from "./chartThemes";

interface Props {
    data: any[];
    stacked: boolean;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
const CustomBarChart: React.FC<Props> = ({ data, stacked, margin }) => {
    // Create a list of keys minus "id" and sort
    const keys = Object.keys(data[0]);
    keys.splice(keys.indexOf("id"), 1);
    const sortedKeys = keySort(keys);

    return (
        <ResponsiveBar
            data={data}
            keys={sortedKeys}
            theme={nivoTheme}
            margin={margin || { top: 50, right: 150, bottom: 80, left: 100 }}
            groupMode={stacked ? "stacked" : "grouped"}
            legends={[
                {
                    dataFrom: "keys",
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: "left-to-right",
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                        {
                            on: "hover",
                            style: {
                                itemOpacity: 1,
                            },
                        },
                    ],
                },
            ]}
        />
    );
};
export default CustomBarChart;
