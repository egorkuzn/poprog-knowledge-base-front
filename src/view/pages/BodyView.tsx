import React from 'react';
import {} from "./../../styles/common/Main.scss";
import {} from "./../../styles/common/Footer.scss";
import {} from "./../../styles/common/Navbar.scss";
import {Navbar} from '../common/navbar/Navbar';
import {Footer} from "../common/footer/Footer";
import {SiteHashNavigator} from "../common/navigation/SiteHashNavigator";

function BodyView(page: React.ReactNode) {
    return (
        <div className="BodyView">
            <Navbar/>
            <SiteHashNavigator/>
            {page}
            <Footer/>
        </div>
    );
}

export default BodyView;
