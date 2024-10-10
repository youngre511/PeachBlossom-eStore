import React from "react";
import "./about.css";

interface Props {}
const About: React.FC<Props> = () => {
    return (
        <div className="about">
            <h1>About This Site</h1>
            <p>
                Peach Blossom is <strong>not a real company</strong>; nor is
                this a functioning e-commerce site&mdash;none of the products
                are real, and the site cannot process real payments. It is
                instead a personal project I undertook in order to teach myself
                Typescript, Redux, and MySQL and to add a full stack web app to
                my <a href="https://ryanyoung.codes">portfolio</a>. In the end,
                my self-imposed curriculum expanded to include Material UI
                components, Nivo charts, JSON Web Tokens, Multer, AWS Elastic
                Beanstalk, AWS Amplify, lambda functions, and more. It was
                created using React with Redux and is supported by a back-end
                server built with Node.js and Express.js. All data is managed by
                a combination of MySQL and MongoDB databases. The text content
                and images have been generated with the help of AI to simulate a
                real e-commerce platform.
            </p>
            <p>
                Despite existing for demonstration purposes only, this is a
                full-featured site, with both a robust customer-facing portal
                and an{" "}
                <a
                    href="https://admin.pb.ryanyoung.codes"
                    style={{ color: "var(--dark-peach)" }}
                >
                    <b>admin portal</b>
                </a>{" "}
                from which one can edit and and remove products, manage
                inventory, view and manage customer orders, manage admin
                accounts, and view (fake) sales analytics. Users can add items
                to their carts, checkout, and track their orders.
            </p>
            <p>
                That said, there are elements that are not currently functional,
                such as the customer accounts button, the recent-views feature,
                and customer management tabs in the admin panel. This is by
                design, as I plan to return to this project over time to add
                these features and explore the possibilities and mechanics of
                customer activity tracking.
            </p>
            <p>
                For questions about this site or to contact me regarding
                employment opportunities or to report bugs, please use the
                contact form on my main portfolio site at{" "}
                <a href="https://ryanyoung.codes">https://ryanyoung.codes</a>.
            </p>
        </div>
    );
};
export default About;
