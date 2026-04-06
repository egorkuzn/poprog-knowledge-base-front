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
import {ProjectItemView} from "./view/pages/projects/ProjectItemView";
import {NotFoundView} from "./view/pages/not-found/NotFoundView";
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
        element: <Home/>
    },
    {
        path: "/projects/:itemSlug",
        element: <ProjectItemView/>
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
        path: "/not-found",
        element: <NotFoundView/>
    },
    {
        path: "*",
        Component: () => {
            window.location.href = "https://www.iae.nsk.su/ru/laboratory-sites/lab-19"
            return null
        }
    }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(  
  <React.StrictMode>
    <RouterProvider router={router} />  
    </React.StrictMode>
);
