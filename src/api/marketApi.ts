import {getJson} from "./http";
import type {MarketCategoriesResponse, MarketSearchResponse} from "./types";

export function getMarketCategories(): Promise<MarketCategoriesResponse> {
    return getJson<MarketCategoriesResponse>("/api/market/categories");
}

export function searchMarketApps(query: string, category: string | null): Promise<MarketSearchResponse> {
    const params = new URLSearchParams();

    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 0) {
        params.set("q", trimmedQuery);
    }

    if (category && category.trim().length > 0 && category !== "Все") {
        params.set("category", category.trim());
    }

    params.set("limit", "48");

    return getJson<MarketSearchResponse>(`/api/market/apps?${params.toString()}`);
}
