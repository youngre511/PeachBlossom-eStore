import React from 'react';
import { useEffect } from 'react';
import {Link} from "react-router-dom"


interface Props {}
const Nav: React.FC<Props> = () => {
    return (
        <div className="nav-bar">
            <ul>
                <li>Shop</li>
                <li><Link to="">About Us</Link></li>
            </ul>
        </div>
    )
}
export default Nav