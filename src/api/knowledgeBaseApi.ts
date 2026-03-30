import {getJson} from "./http";
import type {PublicationsByDateDto, SearchResponse, WorksByProjectTypeDto} from "./types";

export function getGroupedPublications(): Promise<PublicationsByDateDto[]> {
    return getJson<PublicationsByDateDto[]>("/api/publications/grouped");
}

export function getGroupedStudentWorks(): Promise<WorksByProjectTypeDto[]> {
    return getJson<WorksByProjectTypeDto[]>("/api/student-works/grouped");
}

export function searchKnowledgeBase(query: string, limit = 20): Promise<SearchResponse> {
    const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
    });

    return getJson<SearchResponse | {items?: SearchResponse["items"]} | {results?: SearchResponse["items"]} | SearchResponse["items"]>(`/api/search?${params.toString()}`)
        .then((response) => {
            if (Array.isArray(response)) {
                return {items: response};
            }

            const queryValue = "query" in response && typeof response.query === "string" ? response.query : query;
            const totalValue = "total" in response && typeof response.total === "number" ? response.total : undefined;
            const itemsValue = "items" in response && Array.isArray(response.items)
                ? response.items
                : "results" in response && Array.isArray(response.results)
                    ? response.results
                    : [];

            return {
                query: queryValue,
                total: totalValue,
                items: itemsValue
            };
        });
}
