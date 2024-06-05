import React from "react";
import { useEffect } from "react";

interface Props {}
const PrivacyAndCookies: React.FC<Props> = () => {
    return (
        <div className="policies">
            <h1>Privacy Policy</h1>
            <ul>
                <li>
                    <h2>1. Introduction</h2>
                    <p>
                        Peach Blossom ("we," "us," or "our") is committed to
                        protecting the privacy and security of your personal
                        information. This privacy policy explains how we
                        collect, use, and share information about you when you
                        visit or make a purchase from peachblossom.fakedomain.
                    </p>
                </li>
                <li>
                    <h2>2. Information We Collect</h2>
                    <p>
                        When you visit the site, we automatically collect
                        certain information about your device, including
                        information about your web browser, IP address, time
                        zone, and some of the cookies that are installed on your
                        device. Additionally, as you browse the site, we collect
                        information about the individual web pages or products
                        that you view, what websites or search terms referred
                        you to the site, and information about how you interact
                        with the site.
                    </p>
                    <p>
                        When you make a purchase or attempt to make a purchase
                        through the site, we collect certain information from
                        you, including your name, billing address, shipping
                        address, payment information (including credit card
                        numbers), email address, and phone number. We refer to
                        this information as “Order Information.”
                    </p>
                </li>
                <li>
                    <h2>3. How We Use Your Information</h2>
                    <p>
                        We use the Order Information that we collect generally
                        to fulfill any orders placed through the site (including
                        processing your payment information, arranging for
                        shipping, and providing you with invoices and/or order
                        confirmations). Additionally, we use this Order
                        Information to:
                    </p>
                    <ul>
                        <li>Communicate with you;</li>
                        <li>
                            Screen our orders for potential risk or fraud; and
                        </li>
                        <li>
                            When in line with the preferences you have shared
                            with us, provide you with information or advertising
                            relating to our products or services.
                        </li>
                    </ul>
                    <p>
                        We use the Device Information that we collect to help us
                        screen for potential risk and fraud (in particular, your
                        IP address), and more generally to improve and optimize
                        our site (for example, by generating analytics about how
                        our customers browse and interact with the site, and to
                        assess the success of our marketing and advertising
                        campaigns).
                    </p>
                </li>
                <li>
                    <h2>4. Sharing Your Information</h2>
                    <p>
                        We share your Personal Information with third parties to
                        help us use your Personal Information, as described
                        above. For example, we use Google Analytics to help us
                        understand how our customers use the site.
                    </p>
                    <p>
                        Finally, we may also share your Personal Information to
                        comply with applicable laws and regulations, to respond
                        to a subpoena, search warrant or other lawful request
                        for information we receive, or to otherwise protect our
                        rights.
                    </p>
                </li>
                <li>
                    <h2>5. Cookies</h2>
                    <p>
                        A cookie is a small amount of information that’s
                        downloaded to your computer or device when you visit our
                        Site. We use a number of different cookies, including
                        functional, performance, advertising, and social media
                        or content cookies. Cookies make your browsing
                        experience better by allowing the site to remember your
                        actions and preferences (such as login and region
                        selection). This means you don’t have to re-enter this
                        information each time you return to the site or browse
                        from one page to another. Cookies also provide
                        information on how people use the website, for instance
                        whether it’s their first time visiting or if they are a
                        frequent visitor.
                    </p>
                </li>
                <li>
                    <h2>6. Your Rights</h2>
                    <p>
                        If you are a resident of the European Economic Area
                        (EEA), you have the right to access personal information
                        we hold about you and to ask that your personal
                        information be corrected, updated, or deleted. If you
                        would like to exercise this right, please contact us
                        through the contact information below.
                    </p>
                    <p>
                        Additionally, if you are a resident of the EEA, we note
                        that we are processing your information in order to
                        fulfill contracts we might have with you (for example if
                        you make an order through the site), or otherwise to
                        pursue our legitimate business interests listed above.
                        Additionally, please note that your information will be
                        transferred outside of Europe, including to Canada and
                        the United States.
                    </p>
                </li>
                <li>
                    <h2>7. Data Retention</h2>
                    <p>
                        When you place an order through the Site, we will
                        maintain your Order Information for our records unless
                        and until you ask us to delete this information.
                    </p>
                </li>
                <li>
                    <h2>8. Changes</h2>
                    <p>
                        We may update this privacy policy from time to time in
                        order to reflect, for example, changes to our practices
                        or for other operational, legal, or regulatory reasons.
                    </p>
                </li>
                <li>
                    <h2>9. Contact Us</h2>
                    <p>
                        For more information about our privacy practices, if you
                        have questions, or if you would like to make a
                        complaint, please contact us by e-mail at
                        support@peachblossom.fakedomain or by mail using the
                        details provided below:
                    </p>
                    <p>
                        Peach Blossom, [Business Address if this were a real
                        company.].
                    </p>
                </li>
            </ul>
        </div>
    );
};
export default PrivacyAndCookies;
