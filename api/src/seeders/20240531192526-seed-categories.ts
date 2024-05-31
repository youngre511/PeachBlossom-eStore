import { QueryInterface } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkInsert("Categories", [
            {
                category_name: "Electronics",
            },
            {
                category_name: "Books",
            },
            {
                category_name: "Clothing",
            },
        ]);
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete("Categories", {});
    },
};
