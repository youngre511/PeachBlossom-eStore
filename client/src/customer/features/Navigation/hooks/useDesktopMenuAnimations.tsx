import {
    useState,
    useEffect,
    useCallback,
    useRef,
    SetStateAction,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface DesktopMenuAnimationsProps {
    headerRef: React.RefObject<HTMLElement>;
}

interface DesktopMenuAnimations {
    isSearchBarVisible: boolean;
    setIsSearchBarVisible: React.Dispatch<SetStateAction<boolean>>;
    shopAnimationRef: React.RefObject<GSAPTimeline | null>;
    cartAnimationRef: React.RefObject<GSAPTimeline | null>;
    recentAnimationRef: React.RefObject<GSAPTimeline | null>;
}

function useDesktopMenuAnimations({
    headerRef,
}: DesktopMenuAnimationsProps): DesktopMenuAnimations {
    const shopAnimationRef = useRef<GSAPTimeline | null>(null);
    const cartAnimationRef = useRef<GSAPTimeline | null>(null);
    const recentAnimationRef = useRef<GSAPTimeline | null>(null);

    const [isSearchBarVisible, setIsSearchBarVisible] =
        useState<boolean>(false);

    const { contextSafe } = useGSAP({ scope: headerRef });

    useEffect(
        contextSafe(() => {
            // Shop dropdown animation
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

            // Cart dropdown animation
            cartAnimationRef.current = gsap
                .timeline({ paused: true })
                .to(".drop-cart", {
                    duration: 0.3,
                    opacity: 1,
                    scale: 1,
                    ease: "power1.inOut",
                });
            // The animation is played in reverse for hiding

            // Ensure the menu is hidden initially
            gsap.set(".drop-cart", { display: "none", opacity: 0 });

            // Recent items dropdown animation
            recentAnimationRef.current = gsap
                .timeline({ paused: true })
                .to(".recent-items", {
                    duration: 0.3,
                    opacity: 1,
                    scale: 1,
                    ease: "power1.inOut",
                });
            // The animation is played in reverse for hiding

            // Ensure the menu is hidden initially
            gsap.set(".recent-items", { display: "none", opacity: 0 });
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

    return {
        isSearchBarVisible,
        setIsSearchBarVisible,
        cartAnimationRef,
        shopAnimationRef,
        recentAnimationRef,
    };
}

export default useDesktopMenuAnimations;
