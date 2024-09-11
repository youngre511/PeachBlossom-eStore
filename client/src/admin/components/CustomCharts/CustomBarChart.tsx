import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import { useEffect } from "react";

interface Props {
    data: any[];
}
const CustomBarChart: React.FC<Props> = ({ data }) => {
    return <ResponsiveBar data={data} />;
};
export default CustomBarChart;
