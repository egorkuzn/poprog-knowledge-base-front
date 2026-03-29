import BodyView from "../BodyView";

export function DocsView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main>
            <h1>Docs View</h1>
        </main>
    )
}