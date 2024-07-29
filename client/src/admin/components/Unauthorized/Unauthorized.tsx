import React from "react";
import { useEffect } from "react";

interface Props {}
const unauthorized: React.FC<Props> = () => {
    return <div>401 Error: Unauthorized to view this page.</div>;
};
export default unauthorized;
