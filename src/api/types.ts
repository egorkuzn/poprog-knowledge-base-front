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

export interface AccountProfileResponse {
    subject: string
    name: string
    email: string
    roles: string[]
}

export interface UpdateAccountProfileRequest {
    name: string
    email: string
}

export interface AccountChatSummaryResponse {
    chatId: string
    createdAt: string
    messageCount: number
    lastMessagePreview: string | null
}

export interface AccountFavoriteResponse {
    id: number
    itemType: string
    itemId: string
    title: string
    link: string | null
    createdAt: string
}

export interface UpsertFavoriteRequest {
    itemType: string
    itemId: string
    title: string
    link?: string
}

export interface AccountDonationResponse {
    id: string
    amount: string
    currency: string
    status: string
    source: string | null
    message: string | null
    providerPaymentId: string | null
    confirmationUrl: string | null
    returnUrl: string
    createdAt: string
    updatedAt: string
    paidAt: string | null
}

export interface AdminDonationKpiResponse {
    totalDonationsCount: number
    succeededDonationsCount: number
    pendingDonationsCount: number
    canceledDonationsCount: number
    anonymousDonationsCount: number
    uniqueDonorsCount: number
    totalAmount: string
    succeededAmount: string
    averageAmount: string
    conversionRatePercent: string
    currencies: string[]
}

export interface AdminDonationEventResponse {
    id: string
    eventType: string
    eventAt: string
    status: string
    amount: string
    currency: string
    userSub: string | null
    source: string | null
    message: string | null
    providerPaymentId: string | null
    createdAt: string
    updatedAt: string
    paidAt: string | null
}

export interface AdminDonationEventPageResponse {
    items: AdminDonationEventResponse[]
    totalCount: number
    page: number
    size: number
}

export interface CreateDonationRequest {
    amount: number
    currency: string
    source?: string
    message?: string
    returnUrl: string
}

export interface UpdateDonationStatusRequest {
    status: "PENDING" | "SUCCEEDED" | "CANCELED"
    providerPaymentId?: string
}

export interface MarketApp {
    id: string
    title: string
    summary: string
    category: string
    tags: string[]
    platform: string
    version: string
    priceModel: string
    downloadUrl: string | null
}

export interface MarketSearchResponse {
    query: string
    category: string | null
    total: number
    items: MarketApp[]
}

export interface MarketCategoriesResponse {
    categories: string[]
}
