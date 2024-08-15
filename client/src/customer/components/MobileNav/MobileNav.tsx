import React, { ChangeEvent } from "react";
import "./mobile-nav.css";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as SearchButton } from "../../../assets/img/search.svg";
import { ReactComponent as CartButton } from "../../../assets/img/cart.svg";
import { ReactComponent as RecentButton } from "../../../assets/img/recent.svg";
import { ReactComponent as AccountButton } from "../../../assets/img/account.svg";
import pblogo from "../../../assets/img/peach-blossom-logo.png";
import ShopNav from "../ShopMenu/ShopNav";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CartDropDown from "../../features/Cart/CartDropDown";
import { RootState } from "../../store/customerStore";
import SearchField from "../../../common/components/Fields/SearchField";
import MenuIcon from "@mui/icons-material/Menu";
import {
    Autocomplete,
    Button,
    InputAdornment,
    SvgIcon,
    TextField,
} from "@mui/material";

interface Props {}
const MobileNav: React.FC<Props> = () => {
    const cart = useAppSelector((state: RootState) => state.cart);
    const [searchOptions, setSearchOptions] = useState<Array<string>>([]);
    const searchOptionsSlice = useAppSelector(
        (state: RootState) => state.searchOptions
    );
    const cartContents = cart.numberOfItems;

    const header = useRef<HTMLElement>(null);

    const [isShopMenuVisible, setShopMenuVisible] = useState<boolean>(false);
    const shopAnimationRef = useRef<GSAPTimeline | null>(null);
    const [isCartDropdownVisible, setCartDropdownVisible] =
        useState<boolean>(false);
    const cartAnimationRef = useRef<GSAPTimeline | null>(null);
    const [isSearchBarVisible, setIsSearchBarVisible] =
        useState<boolean>(false);

    const { contextSafe } = useGSAP({ scope: header });
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        if (searchOptionsSlice.searchOptions) {
            setSearchOptions(searchOptionsSlice.searchOptions);
        }
    }, [searchOptionsSlice]);

    useEffect(
        contextSafe(() => {
            shopAnimationRef.current = gsap
                .timeline({ paused: true })
                .to(".shop-nav", {
                    duration: 0.3,
                    opacity: 1,
                    scale: 1,
                    ease: "power1.inOut",
                });
            // The animation is played in reverse for hiding

            // Ensure the menu is hidden initially
            gsap.set(".shop-nav", { display: "none", opacity: 0 });
        }),
        []
    );

    useEffect(
        contextSafe(() => {
            cartAnimationRef.current = gsap
                .timeline({ paused: true })
                .to(".drop-cart", {
                    duration: 0.2,
                    opacity: 1,
                    scale: 1,
                    ease: "power1.inOut",
                });
            // The animation is played in reverse for hiding

            // Ensure the menu is hidden initially
            gsap.set(".drop-cart", { display: "none", opacity: 0 });
        }),
        []
    );

    useEffect(
        contextSafe(() => {
            if (isSearchBarVisible) {
                gsap.timeline()
                    .set(".search-tab", { display: "block" })
                    .to(".search-tab", {
                        duration: 0.4,
                        right: 0,
                        ease: "power1.inOut",
                    });
            } else {
                gsap.timeline()
                    .to(".search-tab", {
                        right: "-50vw",
                        ease: "power1.inOut",
                        duration: 0.4,
                    })
                    .set(".search-tab", { display: "none" });
            }
        }),
        [isSearchBarVisible]
    );

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const path = `/shop?sort=name-ascend&page=1&search=${searchQuery.replace(
            " ",
            "%20"
        )}`;
        setIsSearchBarVisible(false);
        navigate(path);
        setSearchQuery("");
    };

    const handleShopMouseEnter = () => {
        if (shopAnimationRef.current) {
            // Play the animation forward
            gsap.set(".shop-nav", { display: "block" });
            shopAnimationRef.current.play();
        }
        setShopMenuVisible(true);
    };

    const handleShopMouseLeave = () => {
        if (shopAnimationRef.current) {
            // Reverse the animation (hide the menu)
            shopAnimationRef.current.reverse().then(() => {
                if (!isShopMenuVisible) {
                    gsap.set(".shop-nav", { display: "none" });
                }
            });
        }
        setShopMenuVisible(false);
    };

    const handleCartMouseEnter = () => {
        if (cartContents > 0 && location.pathname !== "/shoppingcart") {
            if (cartAnimationRef.current) {
                // Play the animation forward
                gsap.set(".drop-cart", { display: "block" });
                cartAnimationRef.current.play();
            }
            setCartDropdownVisible(true);
        }
    };

    const handleCartMouseLeave = () => {
        if (cartAnimationRef.current) {
            // Reverse the animation (hide the cart)
            cartAnimationRef.current.reverse().then(() => {
                if (!isCartDropdownVisible) {
                    gsap.set(".drop-cart", { display: "none" });
                }
            });
        }
        setCartDropdownVisible(false);
    };

    useEffect(() => {
        if (location.pathname === "/shoppingcart") {
            handleCartMouseLeave();
            setCartDropdownVisible(false);
        }
    }, [location.pathname]);

    return (
        <header ref={header}>
            <div className="m-blur-filter"></div>
            <div className="m-nav-bar">
                <MenuIcon />
                <div className="m-nav-logo">
                    <div className="m-border-under"></div>
                    <div className="m-border-over"></div>
                    <img src={pblogo} alt="" />
                </div>
                <div
                    className="m-nav-icon"
                    id="search"
                    aria-label="search"
                    tabIndex={0}
                    role="button"
                    onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
                >
                    <SearchButton />
                </div>
            </div>
            {/* <div className="m-nav-bar">
                <ul className="m-left-menu">
                    <li
                        className="m-nav-text"
                        onMouseEnter={() => handleShopMouseEnter()}
                        onMouseLeave={() => handleShopMouseLeave()}
                    >
                        <Link
                            to="/shop"
                            onClick={() => setShopMenuVisible(false)}
                        >
                            Shop
                        </Link>
                    </li>
                    <li className="m-nav-text">
                        <Link to="/about">About</Link>
                    </li>
                    <li className="m-nav-text">
                        <Link to="/sustainability">Sustainability</Link>
                    </li>
                </ul>
                
                <svg width="160px" height="0">
                    <defs>
                        <clipPath id="complex-left-clip">
                            <path
                                transform="scale(0.39)"
                                d="M799.4-.3v74.3c0,66.3.7-86.9,0,86.4h-489.6c-180,0-160.8-160.8-280.8-160.8h770.4"
                            />
                        </clipPath>
                    </defs>
                </svg>
                <ul className="m-right-menu">
                    <li className="m-nav-text">
                        <Link to="/order-status">Orders</Link>
                    </li>
                    <li className="m-nav-text">Support</li>
                    <li>
                        <div
                            className="m-nav-icon"
                            id="search"
                            aria-label="search"
                            tabIndex={0}
                            role="button"
                            onClick={() =>
                                setIsSearchBarVisible(!isSearchBarVisible)
                            }
                        >
                            <SearchButton />
                        </div>
                    </li>
                    <li>
                        <div
                            className="m-nav-icon"
                            id="account"
                            aria-label="account"
                            tabIndex={0}
                            role="button"
                        >
                            <AccountButton />
                        </div>
                    </li>
                    <li>
                        <div
                            className="m-nav-icon"
                            id="recents"
                            aria-label="recently viewed"
                            tabIndex={0}
                            role="button"
                        >
                            <RecentButton />
                        </div>
                    </li>
                    <li>
                        <div
                            className="m-nav-icon"
                            id="cart"
                            aria-label="cart"
                            tabIndex={0}
                            role="button"
                            onMouseEnter={() => handleCartMouseEnter()}
                            onMouseLeave={() => handleCartMouseLeave()}
                            onClick={() => navigate("/shoppingcart")}
                        >
                            <Link
                                to="/shoppingcart"
                                onClick={() => setCartDropdownVisible(false)}
                            >
                                <CartButton />
                                {cartContents > 0 && (
                                    <div
                                        className="m-cart-badge"
                                        aria-live="polite"
                                    >
                                        <div className="m-badge-background"></div>
                                        <div className="m-badge-background-overlay"></div>
                                        <p
                                            id="cart-contents"
                                            aria-label={`Cart with ${cartContents} items`}
                                        >
                                            {cartContents}
                                        </p>
                                    </div>
                                )}
                            </Link>
                        </div>
                    </li>
                </ul>
               
                <div className="m-search-tab">
                    <div className="m-search-input">
                        <form onSubmit={(e) => handleSearch(e)}>
                            <Autocomplete
                                freeSolo
                                id="product-search"
                                disableClearable
                                filterOptions={(searchOptions) => {
                                    const inputValue =
                                        searchQuery.toLowerCase();
                                    return searchQuery.length >= 2
                                        ? searchOptions.filter((option) =>
                                              option
                                                  .toLowerCase()
                                                  .includes(inputValue)
                                          )
                                        : [];
                                }}
                                options={searchOptions}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Products"
                                        variant="filled"
                                        value={searchQuery}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) => setSearchQuery(e.target.value)}
                                        fullWidth
                                        sx={{
                                            backgroundColor: "white",
                                        }}
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            type: "search",
                                        }}
                                        inputProps={{
                                            ...params.inputProps,
                                            inputMode: "search",
                                            // sx: { backgroundColor: "white" },
                                        }}
                                    />
                                )}
                            />
                            <Button type="submit" style={{ display: "none" }} />
                        </form>
                    </div>
                </div>
                <ShopNav
                    isShopMenuVisible={isShopMenuVisible}
                    handleShopMouseEnter={handleShopMouseEnter}
                    handleShopMouseLeave={handleShopMouseLeave}
                />
                <CartDropDown
                    isCartDropdownVisible={isCartDropdownVisible}
                    handleCartMouseEnter={handleCartMouseEnter}
                    handleCartMouseLeave={handleCartMouseLeave}
                />
            </div> */}
        </header>
    );
};
export default MobileNav;
