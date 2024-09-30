/// <reference types="vite-plugin-svgr/client" />
import React, { ChangeEvent } from "react";
import "./mobile-nav.css";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import SearchButton from "../../../assets/img/search.svg?react";
import CartButton from "../../../assets/img/cart.svg?react";

import AccountButton from "../../../assets/img/account.svg?react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RootState } from "../../store/customerStore";
import MenuSharpIcon from "@mui/icons-material/MenuSharp";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import ChevronRightSharpIcon from "@mui/icons-material/ChevronRightSharp";
import ChevronLeftSharpIcon from "@mui/icons-material/ChevronLeftSharp";

//logo imports
import pblogo1x from "../../../assets/peachblossomlogo-1x.webp";
import pblogo2x from "../../../assets/peachblossomlogo-2x.webp";
import pblogo3x from "../../../assets/peachblossomlogo-3x.webp";
import pbtext1x from "../../../assets/peachblossomtext-1x.webp";
import pbtext2x from "../../../assets/peachblossomtext-2x.webp";
import pbtext3x from "../../../assets/peachblossomtext-3x.webp";

import {
    Autocomplete,
    Button,
    duration,
    InputAdornment,
    SvgIcon,
    TextField,
} from "@mui/material";
import MobileShopCategoryBlock from "./MobileShopCategoryBlock";
import { useNavigationContext } from "../../../common/contexts/navContext";
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

interface Props {}
const MobileNav: React.FC<Props> = () => {
    const { currentRoute, previousRoute } = useNavigationContext();
    const cart = useAppSelector((state: RootState) => state.cart);
    const [searchOptions, setSearchOptions] = useState<Array<string>>([]);
    const searchOptionsSlice = useAppSelector(
        (state: RootState) => state.searchOptions
    );
    const cartContents = cart.numberOfItems;

    const header = useRef<HTMLElement>(null);

    const [isShopMenuVisible, setShopMenuVisible] = useState<boolean>(false);
    const shopAnimationRef = useRef<GSAPTimeline | null>(null);
    const [isSearchBarVisible, setIsSearchBarVisible] =
        useState<boolean>(false);
    const isSearchBarVisibleRef = useRef(isSearchBarVisible);
    const { contextSafe } = useGSAP({ scope: header });
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const categories = useAppSelector(
        (state: RootState) => state.categories.categories
    );
    const menuToggleRef = useRef<GSAPTimeline | null>(null);
    const [forceCollapse, setForceCollapse] = useState<boolean>(false);
    const [staggerDuration, setStaggerDuration] = useState<number>(0);
    const [menusExpanded, setMenusExpanded] = useState<Array<string>>([]);

    // State tracks whether full logo should be visible based on scroll position
    const [showFullLogo, setShowFullLogo] = useState<boolean>(true);

    useEffect(() => {
        if (searchOptionsSlice.searchOptions) {
            setSearchOptions(searchOptionsSlice.searchOptions);
        }
    }, [searchOptionsSlice]);

    // Detect number of categories and set stagger duration for menu-to-shop-menu animation
    useEffect(() => {
        const numberOfElements = categories.length > 5 ? categories.length : 5;
        setStaggerDuration(0.5 + 0.1 * numberOfElements);
    }, [categories]);

    // Navbar logo scroll-triggered animation
    useGSAP(() => {
        gsap.timeline({
            scrollTrigger: {
                trigger: ".m-nav-bar",
                start: "top top+=25px",
                end: "top+=25px top",
                scrub: true,
                // Hide full logo and show text-only logo when scrolling down
                onEnter: () => {
                    gsap.timeline()
                        .to(".m-full-logo", {
                            opacity: 0,
                            duration: 0.5,
                        })
                        .to(
                            ".m-text-only-logo",
                            {
                                opacity: 1,
                                duration: 0.5,
                            },
                            "<"
                        )
                        .set(".m-nav-logo", { height: "111px" })
                        .set(".m-full-logo", { display: "none" });
                    setShowFullLogo(false);
                },
                // Hide text-only logo and show full logo when scrolling to top ONLY if search bar is not visible
                onLeaveBack: () => {
                    if (!isSearchBarVisibleRef.current) {
                        gsap.to(".m-full-logo", { display: "block" });
                        gsap.to(".m-full-logo", {
                            opacity: 1,
                            duration: 0.5,
                        });
                        gsap.to(".m-text-only-logo", {
                            opacity: 0,
                            duration: 0.5,
                        });
                        gsap.to(".m-nav-logo", {
                            duration: 0.5,
                            height: "158px",
                        });
                    }
                    setShowFullLogo(true);
                },
            },
        });
    }, []);

    // Menu hide/show animation
    useEffect(
        contextSafe(() => {
            menuToggleRef.current = gsap
                .timeline({
                    paused: true,
                    onReverseComplete: () => {
                        gsap.set(".m-menu-drawer-container", {
                            display: "none",
                        });
                    },
                })
                .set(".m-menu-drawer-container", { display: "block" })
                .to(".m-menu-drawer", {
                    duration: 0.3,
                    x: 0,
                    onReverseComplete: () => {
                        setShopMenuVisible(false);
                    },
                })
                .to(
                    ".m-menu-drawer-backdrop",
                    { duration: 0.3, opacity: 1 },
                    "<"
                );

            shopAnimationRef.current = gsap
                .timeline({
                    paused: true,
                })
                .set(".m-shop-menu", { display: "block" })
                .to(".m-main-menu ul > li", {
                    duration: 0.2,
                    rotateX: 90,
                    stagger: 0.1,
                })
                .to(
                    ".m-main-menu ul > li",
                    {
                        duration: 0.05,
                        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                        stagger: 0.15,
                    },
                    `<`
                )
                .to(
                    ".m-shop-menu > .m-shop-category-block",
                    {
                        duration: 0.2,
                        rotateX: 0,
                        stagger: 0.1,
                    },
                    `-=${staggerDuration - 0.2}`
                )
                .set(".m-main-menu", {
                    display: "none",
                });

            gsap.set(".m-menu-drawer", { x: "-375px" });
        }),
        []
    );

    const handleCloseMenu = () => {
        if (menuToggleRef.current) {
            menuToggleRef.current.reverse();
            setShopMenuVisible(false);
        }
    };

    const handleOpenMenu = () => {
        if (menuToggleRef.current) {
            menuToggleRef.current.play();
            if (currentRoute && !currentRoute.includes("/shop")) {
                setIsSearchBarVisible(false);
            }
        }
    };

    // Play or reverse shop menu hide/show animation based on value of shopAnimationRef.current
    useEffect(() => {
        if (shopAnimationRef.current) {
            if (isShopMenuVisible) {
                shopAnimationRef.current.play();
            } else {
                if (menusExpanded.length === 0) {
                    shopAnimationRef.current.reverse();
                } else {
                    setForceCollapse(true);
                    setTimeout(() => {
                        shopAnimationRef.current?.reverse();
                        setForceCollapse(false);
                    }, 290);
                }
            }
        }
    }, [isShopMenuVisible]);

    useEffect(() => {
        if (currentRoute) {
            if (
                currentRoute.includes("/shop") &&
                !currentRoute.includes("cart") &&
                (!previousRoute || !previousRoute.includes("/shop"))
            ) {
                setIsSearchBarVisible(true);
            } else if (
                !currentRoute.includes("/shop") &&
                (!previousRoute ||
                    (previousRoute.includes("/shop") &&
                        !previousRoute.includes("cart")))
            ) {
                setIsSearchBarVisible(false);
            }
        }
    }, [currentRoute, previousRoute]);

    // Show/hide search bar animations
    useEffect(
        contextSafe(() => {
            if (isSearchBarVisible) {
                // If full logo is visible, hide full logo and show text-only logo when opening search bar
                if (showFullLogo) {
                    gsap.timeline()
                        .to(".m-full-logo", {
                            opacity: 0,
                        })
                        .to(
                            ".m-text-only-logo",
                            {
                                opacity: 1,
                            },
                            "<"
                        )
                        .to(
                            ".m-nav-logo",
                            { duration: 0.5, height: "111px" },
                            "<"
                        )
                        .set(".m-full-logo", { display: "none" });
                }
                gsap.timeline()
                    .set(".m-search-tab-container", { display: "block" })
                    .to(".m-search-tab", { duration: 0.2, y: 0 });

                isSearchBarVisibleRef.current = true;
            } else {
                // Hide text-only logo and show full logo when closing search menu ONLY if full logo would be shown at current scroll position.
                if (showFullLogo) {
                    gsap.set(".m-full-logo", {
                        display: "block",
                        height: "158px",
                    });
                    gsap.to(".m-full-logo", {
                        opacity: 1,
                    });
                    gsap.to(".m-text-only-logo", {
                        opacity: 0,
                    });
                }
                gsap.timeline()
                    .to(".m-search-tab", { duration: 0.2, y: "-64px" })
                    .set(".m-search-tab-container", { display: "none" });

                isSearchBarVisibleRef.current = false;
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
        navigate(path);
        setSearchQuery("");
    };

    return (
        <header ref={header}>
            <div className="m-blur-filter"></div>
            <div className="m-nav-bar">
                <div className="m-left-navbar">
                    <div
                        className="m-nav-icon"
                        id="menu-button"
                        onClick={handleOpenMenu}
                    >
                        <MenuSharpIcon />
                    </div>
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
                </div>
                <div className="m-nav-logo">
                    <div className="m-full-logo">
                        <div className="m-border-under"></div>
                        <div className="m-border-over"></div>
                        <img
                            src={pblogo3x}
                            srcSet={`${pblogo1x} 1x, ${pblogo2x} 2x, ${pblogo3x} 3x`}
                            alt="peach blossom logo"
                            width="158px"
                            height="158px"
                        />
                        <div
                            className="logo-clickable"
                            onClick={() => navigate("/")}
                        ></div>
                    </div>
                    <div
                        className="m-text-only-logo"
                        onClick={() => navigate("/")}
                    >
                        <img
                            src={pbtext3x}
                            srcSet={`${pbtext1x} 1x, ${pbtext2x} 2x, ${pbtext3x} 3x`}
                            alt="peach blossom logo"
                            width="150px"
                            height="39.398px"
                        />
                    </div>
                </div>
                <div className="m-right-navbar">
                    <div
                        className="m-nav-icon"
                        id="account"
                        aria-label="account"
                        tabIndex={0}
                        role="button"
                    >
                        <AccountButton />
                    </div>
                    <div
                        className="m-nav-icon"
                        id="mobile-cart"
                        aria-label="cart"
                        tabIndex={0}
                        role="button"
                        onClick={() => navigate("/shoppingcart")}
                    >
                        <CartButton />
                        {cartContents > 0 && (
                            <div className="m-cart-badge" aria-live="polite">
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
                    </div>
                </div>
            </div>
            <div className="m-account-tab"></div>
            <div className="m-menu-drawer-container">
                <div className="m-menu-drawer-backdrop" />
                <div className="m-menu-drawer">
                    <div className="m-menu-drawer-header">
                        {isShopMenuVisible ? (
                            <div className="m-menu-title">
                                <button
                                    className="m-back-button"
                                    onClick={() => setShopMenuVisible(false)}
                                >
                                    <ChevronLeftSharpIcon
                                        sx={{
                                            width: "20px",
                                            paddingTop: "5px",
                                        }}
                                    />
                                    <h2>Shop</h2>
                                </button>
                            </div>
                        ) : (
                            <div className="m-menu-title">
                                <h2>Menu</h2>
                            </div>
                        )}
                        <button
                            className="m-close-button"
                            onClick={handleCloseMenu}
                        >
                            <CloseSharpIcon
                                sx={{ width: "20px", height: "20px" }}
                            />
                        </button>
                    </div>
                    <div className="m-main-menu">
                        <ul className="m-menu-items">
                            <li onClick={() => setShopMenuVisible(true)}>
                                <button id="m-shop-button">
                                    Shop{" "}
                                    <ChevronRightSharpIcon
                                        sx={{ width: "20px" }}
                                    />
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        navigate("/order-status");
                                        handleCloseMenu();
                                    }}
                                >
                                    Order Status
                                </button>
                            </li>
                            <li>
                                <button>Support</button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        navigate("/about");
                                        handleCloseMenu();
                                    }}
                                >
                                    About
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        navigate("/sustainability");
                                        handleCloseMenu();
                                    }}
                                >
                                    Sustainability
                                </button>
                            </li>
                            {categories &&
                                categories.length > 5 &&
                                Array(categories.length - 5)
                                    .fill("")
                                    .map((_, index) => (
                                        <li
                                            style={{ height: "54px" }}
                                            key={`empty-li-${index}`}
                                        ></li>
                                    ))}
                        </ul>
                    </div>
                    <div className="m-shop-menu">
                        <div className=".m-shop-category-block">
                            <div
                                className="m-shop-category"
                                style={{ fontWeight: 700 }}
                                onClick={() => {
                                    navigate(`/shop`);
                                    handleCloseMenu();
                                }}
                            >
                                Shop All
                            </div>
                        </div>
                        {categories &&
                            categories.map((category) => {
                                return (
                                    <MobileShopCategoryBlock
                                        category={category}
                                        forceCollapse={forceCollapse}
                                        menusExpanded={menusExpanded}
                                        setMenusExpanded={setMenusExpanded}
                                        key={category.categoryName}
                                        handleCloseMenu={handleCloseMenu}
                                    />
                                );
                            })}
                        {categories &&
                            categories.length < 5 &&
                            Array(5 - categories.length)
                                .fill("")
                                .map((_, index) => (
                                    <div
                                        className="m-shop-category-block"
                                        key={`empty-block-${index}`}
                                        style={{
                                            height: "54px",
                                            width: "100%",
                                        }}
                                    ></div>
                                ))}
                    </div>
                </div>
            </div>
            <div className="m-search-tab-container">
                <div className="m-search-tab">
                    <div className="m-search-input">
                        <form onSubmit={(e) => handleSearch(e)}>
                            <Autocomplete
                                freeSolo
                                id="product-search"
                                // disableClearable
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
                                onInputChange={(
                                    e: React.SyntheticEvent,
                                    value: string,
                                    reason: string
                                ) => {
                                    if (reason === "clear") {
                                        setSearchQuery("");
                                        if (
                                            currentRoute &&
                                            currentRoute.includes("/shop")
                                        ) {
                                            navigate(
                                                "/shop?sort=name-ascend&page=1"
                                            );
                                        }
                                    }
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
            </div>
        </header>
    );
};
export default MobileNav;
