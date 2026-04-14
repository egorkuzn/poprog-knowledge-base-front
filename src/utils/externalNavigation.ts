import {trackMetricEvent} from "./analytics";

const updaterMarkup = `
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Проверка ресурса</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: "Tilda Sans VF", sans-serif; background: #f7f7f8; color: #181818; }
    .wrap { display: grid; justify-items: center; gap: 14px; padding: 24px; text-align: center; }
    .spinner { width: 42px; height: 42px; border: 3px solid #d6d6da; border-top-color: #181818; border-radius: 50%; animation: spin 0.85s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .caption { font-size: 16px; line-height: 1.35; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="spinner" aria-hidden="true"></div>
    <div class="caption">Проверяем доступность ресурса...</div>
  </div>
</body>
</html>
`;

interface OpenExternalUrlOptions {
    notFoundPath?: string
    openedTab?: Window | null
}

export interface ExternalNavigationRequestDetail {
    targetUrl: string
    notFoundPath?: string
}

export const EXTERNAL_NAVIGATION_REQUEST_EVENT = "site-external-navigation:request";

function openUpdaterTab(): Window | null {
    const tab = window.open("", "_blank");

    if (!tab) {
        return null;
    }

    tab.document.write(updaterMarkup);
    tab.document.close();
    return tab;
}

function resolveNotFoundUrl(notFoundPath = "/not-found"): string {
    return `${window.location.origin}${notFoundPath.startsWith("/") ? notFoundPath : `/${notFoundPath}`}`;
}

function resolveTargetUrl(targetUrl: string): string {
    return new URL(targetUrl, window.location.origin).toString();
}

async function isConfirmedNotFound(targetUrl: string): Promise<boolean> {
    try {
        const headResponse = await fetch(targetUrl, {method: "HEAD"});

        if (headResponse.status === 404) {
            return true;
        }

        if (headResponse.status === 405) {
            try {
                const getResponse = await fetch(targetUrl, {method: "GET"});
                return getResponse.status === 404;
            } catch {
                // Some resources block CORS checks, fallback to open resource in browser tab.
                return false;
            }
        }

        return false;
    } catch {
        // Cannot reliably check status (network/CORS), do not block navigation.
        return false;
    }
}

function openUrlInTab(url: string, openedTab?: Window | null) {
    if (openedTab) {
        openedTab.location.replace(url);
        return;
    }

    window.open(url, "_blank");
}

export function isExternalResourceUrl(targetUrl: string): boolean {
    try {
        return new URL(targetUrl, window.location.origin).origin !== window.location.origin;
    } catch {
        return false;
    }
}

export async function openExternalUrlInNewTabWithCheck(targetUrl: string, options: OpenExternalUrlOptions = {}): Promise<void> {
    const resolvedTarget = resolveTargetUrl(targetUrl);
    const openedTab = options.openedTab ?? openUpdaterTab();
    const notFoundUrl = resolveNotFoundUrl(options.notFoundPath);

    if (!openedTab) {
        return;
    }

    trackMetricEvent("external_link_click", {
        targetUrl: resolvedTarget
    });

    const notFound = await isConfirmedNotFound(resolvedTarget);
    openUrlInTab(notFound ? notFoundUrl : resolvedTarget, openedTab);
}

export async function requestExternalNavigation(targetUrl: string, options: OpenExternalUrlOptions = {}): Promise<void> {
    const resolvedTarget = resolveTargetUrl(targetUrl);
    const event = new CustomEvent<ExternalNavigationRequestDetail>(EXTERNAL_NAVIGATION_REQUEST_EVENT, {
        detail: {
            targetUrl: resolvedTarget,
            notFoundPath: options.notFoundPath
        }
    });
    window.dispatchEvent(event);
}
