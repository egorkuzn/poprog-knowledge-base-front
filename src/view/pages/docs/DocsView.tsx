import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";

export function DocsView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main>
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Документация"}]}/>
            <h1>Docs View</h1>
        </main>
    )
}
