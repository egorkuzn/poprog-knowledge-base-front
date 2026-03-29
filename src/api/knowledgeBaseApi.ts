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

    return getJson<SearchResponse>(`/api/search?${params.toString()}`);
}
