import {useEffect} from "react";
import {useLocation} from "react-router-dom";

export function SiteHashNavigator() {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) {
            return;
        }

        const targetId = decodeURIComponent(location.hash.slice(1));
        const scrollToAnchor = () => {
            const anchorElement = document.getElementById(targetId);
            if (!anchorElement) {
                return;
            }

            anchorElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        };

        const timeoutId = window.setTimeout(scrollToAnchor, 60);
        return () => window.clearTimeout(timeoutId);
    }, [location.hash, location.pathname]);

    return null;
}
