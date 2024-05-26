import { v4 as uuidv4 } from "uuid";

const generateProductNo = (prefix: string): string => {
    return `${prefix}-${uuidv4()}`;
};

export default generateProductNo;
