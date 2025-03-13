import {
    useState,
    useEffect,
    useCallback,
    useRef,
    SetStateAction,
} from "react";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ShopFilterDrawerAnimationProps {
    shopRef: React.RefObject<HTMLElement>;
    setFilterDrawerOpen: React.Dispatch<SetStateAction<boolean>>;
    filterDrawerOpen: boolean;
    itemsPerPage: number;
    fetchData: (force?: boolean) => void;
}

interface ShopFilterDrawerAnimation {
    filterAnimationRef: React.RefObject<GSAPTimeline | null>;
}

function useShopFilterDrawerAnimation({
    shopRef,
    filterDrawerOpen,
    setFilterDrawerOpen,
    itemsPerPage,
    fetchData,
}: ShopFilterDrawerAnimationProps): ShopFilterDrawerAnimation {
    const filterAnimationRef = useRef<GSAPTimeline | null>(null);
    const { width } = useWindowSizeContext();
    const [currentWidth, setCurrentWidth] = useState<number | null>(null);
    const [drawerInitialized, setDrawerInitialized] = useState<boolean>(false);
    const { contextSafe } = useGSAP({ scope: shopRef });
    useEffect(
        // Set up drawer animation
        contextSafe(() => {
            // Initialize animation on resize only if width is under 1155 (and therefore .filter-options-drawer is rendered) and if it has not already been initialized.
            if (width && width < 1155 && !drawerInitialized) {
                filterAnimationRef.current = gsap
                    .timeline({
                        paused: true,
                    })
                    .set(".filter-options-drawer", { display: "block" })
                    .to(".filter-options-drawer", { duration: 0.4, x: 0 });

                if (filterDrawerOpen) {
                    filterAnimationRef.current?.seek(
                        filterAnimationRef.current.duration()
                    );
                }
                // Change initialization tracker state
                setDrawerInitialized(true);
            }

            // Separately, check to see, on resize, if the resize has crossed 550px one way or another. If so, and if itemsPerPage is not 24, run fetchData(), which has logic overriding user-setting for itemsPerPage on mobile (< 550px).
            if (
                itemsPerPage !== 24 &&
                currentWidth &&
                width &&
                ((width >= 550 && currentWidth < 550) ||
                    (width < 550 && currentWidth >= 550))
            ) {
                fetchData(true);
            }
            //Set the current width so that resized widths can be compared to it.
            setCurrentWidth(width);
        }),
        [width]
    );

    useEffect(() => {
        // If window is resized above 1154 and drawer is open, set state tracking open state and the state tracking initialization to false and clear current animation.
        if (width && width >= 1155) {
            if (filterDrawerOpen) {
                setFilterDrawerOpen(false);
            }
            filterAnimationRef.current?.seek(0).pause();
            filterAnimationRef.current = null;
            setDrawerInitialized(false);
        }
    }, [width, filterDrawerOpen]);

    return { filterAnimationRef };
}

export default useShopFilterDrawerAnimation;
