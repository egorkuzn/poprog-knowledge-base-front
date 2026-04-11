export interface PublicationModel {
    id: number
    authors: string
    theme: string
    published: string
    link: string
}

export interface PublicationsByDateDto {
    date: string
    publications: PublicationModel[]
}

export interface WorkModel {
    id: number
    authors: string
    theme: string
    published: string
}

export interface WorksByProjectTypeDto {
    title: string
    hash: string
    works: WorkModel[]
}

export interface SearchResultItem {
    id: string
    type: "publication" | "student-work"
    sourceId: number
    groupTitle: string
    groupHash: string | null
    authors: string
    theme: string
    published: string
    link: string | null
}

export interface SearchResponse {
    query: string
    total: number
    items: SearchResultItem[]
}

export interface ProblemDetail {
    type?: string
    title?: string
    status?: number
    detail?: string
    instance?: string
}

export type AiAssistantChatRole = "system" | "user" | "assistant";

export interface AiAssistantChatMessageRequest {
    role: AiAssistantChatRole
    content: string
}

export interface AiAssistantChatRequest {
    chatId: string | null
    messages: AiAssistantChatMessageRequest[]
}

export interface AiAssistantChatResponse {
    chatId: string
    content: string
    model: string
    finishReason: string | null
    promptTokens: number | null
    completionTokens: number | null
    totalTokens: number | null
}

export interface ChatHistoryMessageResponse {
    id: number
    role: AiAssistantChatRole
    content: string
    createdAt: string
}

export interface ChatHistoryResponse {
    chatId: string
    messages: ChatHistoryMessageResponse[]
}
