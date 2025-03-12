import { SetStateAction, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

interface MobileLogoAnimationProps {
    headerRef: React.RefObject<HTMLElement>;
}

interface MobileLogoAnimation {
    isSearchBarVisible: boolean;
    setIsSearchBarVisible: React.Dispatch<SetStateAction<boolean>>;
}

function useMobileLogoAnimation({
    headerRef,
}: MobileLogoAnimationProps): MobileLogoAnimation {
    const [isSearchBarVisible, setIsSearchBarVisible] =
        useState<boolean>(false);
    const isSearchBarVisibleRef = useRef<boolean>(false);
    const { contextSafe } = useGSAP({ scope: headerRef });
    const [showFullLogo, setShowFullLogo] = useState<boolean>(true);

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

    return { isSearchBarVisible, setIsSearchBarVisible };
}

export default useMobileLogoAnimation;
