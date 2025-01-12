export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/src/tests"],
    // Adjust based on your directory structure
    transform: {
        "^.+\\.tsx?$": "ts-jest", // Use ts-jest to handle .ts and .tsx files
    },

    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
        // This regex says: if import is something like './sqlCategoryModel.js',
        // transform it to './sqlCategoryModel'
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};
