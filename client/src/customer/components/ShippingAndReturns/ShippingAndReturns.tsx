import React from "react";
import { useEffect } from "react";

interface Props {}
const ShippingAndReturns: React.FC<Props> = () => {
    return (
        <div className="policies">
            <h1>Shipping Policy</h1>
            <ul>
                <li>
                    <h2>1. General Information</h2>
                    <p>
                        All orders are subject to product availability. If an
                        item is not in stock at the time you place your order,
                        we will notify you and refund you the total amount of
                        your order, using the original method of payment.
                    </p>
                </li>
                <li>
                    <h2>2. Delivery Location</h2>
                    <p>
                        Items offered on our website are only available for
                        delivery to addresses in the US and Canada. Any
                        shipments outside of the US and Canada are not available
                        at this time.
                    </p>
                </li>
                <li>
                    <h2>3. Delivery Time</h2>
                    <p>
                        An estimated delivery time will be provided to you once
                        your order is placed. Delivery times are estimates and
                        commence from the date of shipping, rather than the date
                        of order. Delivery times are to be used as a guide only
                        and are subject to the acceptance and approval of your
                        order.
                    </p>
                    <p>
                        Unless there are exceptional circumstances, we make
                        every effort to fulfill your order within 2-3 business
                        days of the date of your order. Business day mean Monday
                        to Friday, except holidays. Please note we do not ship
                        on Saturdays or Sundays.
                    </p>
                </li>
                <li>
                    <h2>4. Shipping Costs</h2>
                    <p>
                        Shipping costs are based on the weight of your order and
                        the delivery method. To find out how much your order
                        will cost, simply add the items you would like to
                        purchase to your cart, and proceed to the checkout page.
                        Once at the checkout screen, shipping charges will be
                        displayed.
                    </p>
                    <p>
                        Additional shipping charges may apply to remote areas or
                        for large or heavy items. You will be advised of any
                        charges on the checkout page.
                    </p>
                </li>
                <li>
                    <h2>5. Damaged Items in Transport</h2>
                    <p>
                        If there is any damage to the packaging on delivery,
                        contact us immediately at
                        support@peachblossom.fakedomain.
                    </p>
                </li>
                <li>
                    <h2>6. Questions</h2>
                    <p>
                        If you have any questions about the delivery and
                        shipment or your order, please contact us at
                        support@peachblossom.fakedomain.
                    </p>
                </li>
            </ul>
            <h1>Returns Policy</h1>
            <ul>
                <li>
                    <h2>1. Return Due to Change of Mind</h2>
                    <p>
                        Peach Blossom will happily accept returns due to change
                        of mind as long as a request to return is received by us
                        within 90 days of receipt of item and are returned to us
                        in original packaging, unused and in resellable
                        condition. Return shipping will be paid at the customers
                        expense and will be required to arrange their own
                        shipping.
                    </p>
                    <p>
                        Once returns are received and accepted, refunds will be
                        processed to store credit for a future purchase. We will
                        notify you once this has been completed through email.
                    </p>
                    <p>
                        Peach Blossom will refund the value of the goods
                        returned but will NOT refund the value of any shipping
                        paid.
                    </p>
                </li>
                <li>
                    <h2>2. Warranty Returns</h2>
                    <p>
                        Peach Blossom will happily honor any valid warranty
                        claims, provided a claim is submitted within [number]
                        days of receipt of items. Customers will be required to
                        pre-pay the return shipping, however we will reimburse
                        you upon successful warranty claim. Upon return receipt
                        of items for warranty claim, you can expect Peach
                        Blossom to process your warranty claim within 2-3 days.
                    </p>
                    <p>
                        Once warranty claim is confirmed, you will receive the
                        choice of:
                    </p>
                    <ul>
                        <li>(a) refund to your payment method</li>
                        <li>(b) a refund in store credit</li>
                        <li>
                            (c) a replacement item sent to you (if stock is
                            available)
                        </li>
                    </ul>
                </li>
                <li>
                    <h2>3. Cancellation Policy</h2>
                    <h3>Cancellation Before Shipment</h3>
                    <p>
                        If you change your mind after placing an order, you can
                        cancel at any time before your order has been
                        dispatched. If your order has not yet shipped, we will
                        cancel it and fully refund you via the original payment
                        method. We aim to process cancellations within 24 hours
                        after the request is made. If you wish to cancel your
                        order, please contact us immediately at
                        support@peachblossom.fakedomain.
                    </p>
                    <h3>Cancellation After Shipment</h3>
                    <p>
                        If your order has already been shipped, our standard
                        return policy will apply. You will need to wait until
                        you receive the product and then arrange for it to be
                        returned in accordance with our returns policy. Shipping
                        costs are non-refundable, and the cost of return
                        shipping will be deducted from your refund.
                    </p>
                </li>
                <li>
                    <h2>4. Customer Service</h2>
                    <p>
                        For all customer service enquiries, please email us at
                        support@peachblossom.fakedomain.
                    </p>
                </li>
            </ul>
            <h1>Delivery Terms</h1>
            <ul>
                <li>
                    <h3>In Transit</h3>
                    <p>
                        Your order has been dispatched from our warehouse and is
                        on its way to you.
                    </p>
                </li>
                <li>
                    <h3>Pending</h3>
                    <p>
                        Your order is being prepared or is awaiting confirmation
                        or resolution of a payment issue.
                    </p>
                </li>

                <li>
                    <h3>Delivered</h3>
                    <p>
                        Your order has arrived at its final destination and has
                        been confirmed as received.
                    </p>
                </li>

                <li>
                    <h3>Failed Delivery Attempt</h3>
                    <p>
                        An attempt to deliver your order was made but was not
                        successful.
                    </p>
                </li>

                <li>
                    <h3>Returned to Sender</h3>
                    <p>
                        The order could not be delivered and has been sent back
                        to our facility.
                    </p>
                </li>
            </ul>
        </div>
    );
};
export default ShippingAndReturns;
