# Peach Blossom E-Store

Peach Blossom is a full-stack web app and mock e-commerce site I created in order to teach myself typescript, redux, and mysql. It comprises a node/express back-end supported by lambda functions and a bifurcated front-end website consisting of a customer-facing e-store and a full-featured admin panel with sales analytics and inventory, product, and order management. The site relies on a combination of mysql and mongodb for data persistence. Most of the images and text are ai-generated. Though the products aren’t real and the site does not accept or process real payments, it is otherwise fully functional.

### Phase 1: E-Store MVP

-   Minimal Front-End
    -   Browsable Catalog [COMPLETE]
    -   Product Detail Pages [COMPLETE]
    -   Search [COMPLETE]
    -   Filtering [COMPLETE]
    -   ~~Customer Service Links~~
    -   Cart [COMPLETE]
    -   Checkout [COMPLETE]
    -   Order Status [COMPLETE]
    -   Order Confirmation [COMPLETE]
-   Minimal Back-End [COMPLETE]
    -   Databases [COMPLETE]
        -   SQL [COMPLETE]
            -   Orders [COMPLETE]
            -   OrderItems [COMPLETE]
            -   Basic Product Info [COMPLETE]
            -   Carts [COMPLETE]
            -   CartItems [COMPLETE]
            -   Categories [COMPLETE]
            -   Subcategories [COMPLETE]
            -   Products [COMPLETE]
            -   Promotions [COMPLETE]
            -   ShippingAddresses [COMPLETE]
            -   Inventory [COMPLETE]
        -   MongoDB [COMPLETE]
            -   Products [COMPLETE]
            -   Categories [COMPLETE]
    -   CRUD Functionality for all of the above [COMPLETE]
    -   Infrastructure in place for promotions [COMPLETE]

### Phase 2: Basic Admin UI

-   Product Management [COMPLETE]
    -   Add Products [COMPLETE]
    -   View Products with Sort and Filter [COMPLETE]
    -   Update Products [COMPLETE]
    -   Discontinue Products [COMPLETE]
    -   Delete Products (Back-End Only for Data Integrity) [COMPLETE]
-   Categories [COMPLETE]
    -   Manage Categories and Subcategories [COMPLETE]
-   Inventory Management [COMPLETE]
-   Order Management [COMPLETE]
-   Dashboard [COMPLETE]
    -   Basic Sales Trends [COMPLETE]
-   Admin User Accounts [COMPLETE]
    -   SQL User Table [COMPLETE]
    -   SQL Admin Table [COMPLETE]
-   Admin User Management [COMPLETE]
-   Admin Login/Logout [COMPLETE]
    -   BE Auth Middleware [COMPLETE]
    -   FE Auth Context [COMPLETE]
    -   Access Tokens [COMPLETE]
    -   Refresh Tokens [COMPLETE]
    -   SQL Refresh Token Table [COMPLETE]

### Phase 3: Customer Accounts

-   LogIn/LogOut [COMPLETE]
-   SQL Tables [COMPLETE]
    -   Customer [COMPLETE]
    -   Customer Address [COMPLETE]
-   Account Management [COMPLETE]
    -   Address Management [COMPLETE]
    -   Order History [COMPLETE]
    -   Account Closure [INPROCESS]
-   Account-linked Carts [COMPLETE]
-   Customer Address Checkout Integration [COMPLETE]
-   User Preferences

### Phase 4: Advanced Admin UI

-   Customer Management [COMPLETE]
-   Marketing and Promotions Management

### Phase 5: Customer Activity Logging

-   Recently Viewed Items [COMPLETE]
-   Cookie Preferences Banner [COMPLETE]
-   MongoDB activity collection [COMPLETE]
-   API Endpoints [COMPLETE]
    -   Assign/retrieve/revoke tracking ids [COMPLETE]
    -   Activity Logging [COMPLETE]
    -   Associate userId with tracking id [COMPLETE]
-   Add logs to userDataSlice [COMPLETE]
-   Thunk pushing activity logs to back end [COMPLETE]

### Phase 6: Customer Recommendations

-   Activity Data Processing Algorithms
-   Implement search result product prioritization based on customer trends
-   Add "you might also be interested in" to cart and/or checkout
