import BodyView from "../BodyView";
import {requestExternalNavigation} from "../../../utils/externalNavigation";

const fallbackExternalUrl = "https://www.iae.nsk.su/ru/laboratory-sites/lab-19";

export function ExternalFallbackView() {
    return BodyView(
        <main style={{padding: "48px 24px", minHeight: "40vh"}}>
            <h1 style={{margin: 0, fontSize: "32px", lineHeight: 1.2}}>Страница не найдена</h1>
            <p style={{marginTop: "16px", maxWidth: "760px"}}>
                Вы можете перейти на внешний сайт лаборатории, чтобы продолжить поиск информации.
            </p>
            <button
                onClick={() => {
                    void requestExternalNavigation(fallbackExternalUrl);
                }}
                style={{
                    marginTop: "20px",
                    minHeight: "44px",
                    padding: "0 18px",
                    borderRadius: "12px",
                    border: "1px solid #171717",
                    background: "#171717",
                    color: "#ffffff",
                    cursor: "pointer"
                }}
                type="button"
            >
                Перейти на сайт лаборатории
            </button>
        </main>
    );
}
