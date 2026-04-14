import React from "react";
import {} from "./index.css";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import {WorksView} from "./view/pages/works/WorksView";
import {VideoView} from "./view/pages/video/VideoView";
import {PublicationsView} from "./view/pages/publications/PublicationsView";
import {DocsView} from "./view/pages/docs/DocsView";
import {Home} from "./view/pages/home/Home";
import {ChatView} from "./view/pages/chat/ChatView";
import {ProjectsView} from "./view/pages/projects/ProjectsView";
import {ProjectItemView} from "./view/pages/projects/ProjectItemView";
import {MarketView} from "./view/pages/market/MarketView";
import {AccountView} from "./view/pages/account/AccountView";
import {AdminDonationsView} from "./view/pages/account/AdminDonationsView";
import {DonateView} from "./view/pages/donate/DonateView";
import {SupportView} from "./view/pages/support/SupportView";
import {ContactView} from "./view/pages/contact/ContactView";
import {NotFoundView} from "./view/pages/not-found/NotFoundView";
import {ExternalFallbackView} from "./view/pages/not-found/ExternalFallbackView";
import {CookiesView, PrivacyView, TermsView} from "./view/pages/legal/LegalViews";
import { createBrowserRouter} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/home",
        element: <Home/>
    },
    {
        path: "/works",
        element: <WorksView/>
    },
    {
        path: "/docs",
        element: <DocsView/>
    },
    {
        path: "/projects",
        element: <ProjectsView/>
    },
    {
        path: "/projects/:itemSlug",
        element: <ProjectItemView/>
    },
    {
        path: "/market",
        element: <MarketView/>
    },
    {
        path: "/account",
        element: <AccountView/>
    },
    {
        path: "/account/admin/donations",
        element: <AdminDonationsView/>
    },
    {
        path: "/donate",
        element: <DonateView/>
    },
    {
        path: "/support",
        element: <SupportView/>
    },
    {
        path: "/contact",
        element: <ContactView/>
    },
    {
        path: "/publications",
        element: <PublicationsView/>
    },
    {
        path: "/video",
        element: <VideoView/>
    },
    {
        path: "/chat",
        element: <ChatView/>
    },
    {
        path: "/privacy",
        element: <PrivacyView/>
    },
    {
        path: "/terms",
        element: <TermsView/>
    },
    {
        path: "/cookies",
        element: <CookiesView/>
    },
    {
        path: "/not-found",
        element: <NotFoundView/>
    },
    {
        path: "*",
        element: <ExternalFallbackView/>
    }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(  
  <React.StrictMode>
    <RouterProvider router={router} />  
    </React.StrictMode>
);
