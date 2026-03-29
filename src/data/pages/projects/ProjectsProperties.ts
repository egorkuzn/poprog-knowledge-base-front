import industrialCImg from "../../../images/pages/projects/industrial-c.jpg"
import reflexImg from "../../../images/pages/projects/reflex.jpg"
import postImg from "../../../images/pages/projects/post.jpg"
import edtlImg from "../../../images/pages/projects/edtl.jpg"
import rideImg from "../../../images/pages/projects/ride.jpg"
import type {ProjectModel} from "../../../model/pages/projects/ProjectModel";

export const PROJECTS_DATA: ProjectModel[] = [
    {
        name: "Язык Reflex",
        link: "reflex"
    },
    {
        name: "Язык poST",
        link: "post"
    },
    {
        name: "Язык IndustrialC",
        link: "industrial-c"
    },
    {
        name: "EDTL",
        link: "edtl"
    },
    {
        name: "Проект RIDE/THEIA",
        link: "ride"
    }
]

export const PROJECTS_IMAGES: {[index: string]: string} = {
    reflex: reflexImg,
    post: postImg,
    "industrial-c": industrialCImg,
    edtl: edtlImg,
    ride: rideImg
}
