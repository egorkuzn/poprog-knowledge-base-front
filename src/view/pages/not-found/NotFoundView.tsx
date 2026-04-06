import BodyView from "../BodyView";

export function NotFoundView() {
    return BodyView(
        <main style={{padding: "48px 24px", minHeight: "40vh"}}>
            <h1 style={{margin: 0, fontSize: "32px", lineHeight: 1.2}}>Ничего не найдено</h1>
        </main>
    );
}
