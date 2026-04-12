import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";

export function VideoView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main>
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Видео"}]}/>
            <h1>VideoView</h1>
        </main>
    )
}
