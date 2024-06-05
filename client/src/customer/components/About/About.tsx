import React from "react";
import { useEffect } from "react";

interface Props {}
const About: React.FC<Props> = () => {
    return (
        <React.Fragment>
            <h1>About Us</h1>
            <p>
                Peach Blossom is <strong>not a real company</strong>; nor is
                this a functioning e-commerce site&mdash;none of the products
                are real, and the site cannot process real payments. It is
                instead a dummy site created for my portfolio to showcase my
                abilities as a full-stack developer. It was created using React
                with Redux and is supported by a back-end server built with
                Node.js and Express.JS. All data is managed by a combination of
                MySQL and MongoDB databases. The text content and images have
                been generated with the help of AI to simulate a real e-commerce
                platform.
            </p>
            <p>
                Despite existing for demonstration purposes only, this is a
                full-featured site, with both a robust customer-facing portal
                and an admin portal from which one can and and remove products,
                manage inventory, and view (fake) sales analytics.
            </p>
        </React.Fragment>
    );
};
export default About;
