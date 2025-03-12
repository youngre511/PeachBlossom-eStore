import {
    useState,
    useEffect,
    useCallback,
    useRef,
    SetStateAction,
} from "react";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Category } from "../../../store/categories/CategoriesTypes";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

interface MobileMenuAnimationProps {
    headerRef: React.RefObject<HTMLElement>;
    categories: Category[];
    menusExpandedLength: number;
    setForceCollapse: React.Dispatch<SetStateAction<boolean>>;
}

interface MobileMenuAnimation {
    isShopMenuVisible: boolean;
    setShopMenuVisible: React.Dispatch<SetStateAction<boolean>>;
    menuToggleRef: React.RefObject<GSAPTimeline | null>;
}

function useMobileMenuAnimation({
    headerRef,
    categories,
    menusExpandedLength,
    setForceCollapse,
}: MobileMenuAnimationProps): MobileMenuAnimation {
    const menuToggleRef = useRef<GSAPTimeline | null>(null);
    const shopAnimationRef = useRef<GSAPTimeline | null>(null);
    const { contextSafe } = useGSAP({ scope: headerRef });
    const [isShopMenuVisible, setShopMenuVisible] = useState<boolean>(false);

    const [staggerDuration, setStaggerDuration] = useState<number>(0);

    // Detect number of categories and set stagger duration for menu-to-shop-menu animation
    useEffect(() => {
        const numberOfElements = categories.length > 5 ? categories.length : 5;
        setStaggerDuration(0.5 + 0.1 * numberOfElements);
    }, [categories]);

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

    // Play or reverse shop menu hide/show animation based on value of shopAnimationRef.current
    useEffect(() => {
        if (shopAnimationRef.current) {
            if (isShopMenuVisible) {
                shopAnimationRef.current.play();
            } else {
                if (menusExpandedLength === 0) {
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

    return { isShopMenuVisible, setShopMenuVisible, menuToggleRef };
}

export default useMobileMenuAnimation;
