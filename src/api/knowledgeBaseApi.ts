import {getJson, postJson} from "./http";
import type {
    AiAssistantChatRequest,
    AiAssistantChatResponse,
    ChatHistoryResponse,
    PublicationsByDateDto,
    SearchResponse,
    WorksByProjectTypeDto
} from "./types";

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

    return getJson<SearchResponse | {query?: string; total?: number; items?: SearchResponse["items"]} | {results?: SearchResponse["items"]} | SearchResponse["items"]>(`/api/search?${params.toString()}`)
        .then((response) => {
            if (Array.isArray(response)) {
                return {
                    query,
                    total: response.length,
                    items: response
                };
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
                total: typeof totalValue === "number" ? totalValue : itemsValue.length,
                items: itemsValue
            };
        });
}

export function assistantChat(request: AiAssistantChatRequest): Promise<AiAssistantChatResponse> {
    return postJson<AiAssistantChatResponse, AiAssistantChatRequest>("/api/assistant/chat", request);
}

export function getAssistantChatHistory(chatId: string): Promise<ChatHistoryResponse> {
    return getJson<ChatHistoryResponse>(`/api/assistant/chats/${chatId}/messages`);
}
