import React from 'react';
import {useEffect} from "react";
import {useLocation} from "react-router-dom";
import {} from "./../../styles/common/Main.scss";
import {} from "./../../styles/common/Footer.scss";
import {} from "./../../styles/common/Navbar.scss";
import {Navbar} from '../common/navbar/Navbar';
import {Footer} from "../common/footer/Footer";
import {SiteHashNavigator} from "../common/navigation/SiteHashNavigator";
import {trackMetricEvent} from "../../utils/analytics";

function AnalyticsRouteTracker() {
    const location = useLocation();

    useEffect(() => {
        trackMetricEvent("page_view");
    }, [location.pathname, location.search]);

    return null;
}

function BodyView(page: React.ReactNode) {
    return (
        <div className="BodyView">
            <AnalyticsRouteTracker/>
            <Navbar/>
            <SiteHashNavigator/>
            {page}
            <Footer/>
        </div>
    );
}

export default BodyView;
