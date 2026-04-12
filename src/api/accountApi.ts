import {deleteJson, getJson, postJson, putJson} from "./http";
import type {
    AccountChatSummaryResponse,
    AccountDonationResponse,
    AccountFavoriteResponse,
    AccountProfileResponse,
    CreateDonationRequest,
    UpdateAccountProfileRequest,
    UpdateDonationStatusRequest,
    UpsertFavoriteRequest
} from "./types";

export function getAccountProfile(): Promise<AccountProfileResponse> {
    return getJson<AccountProfileResponse>("/api/account/profile");
}

export function updateAccountProfile(request: UpdateAccountProfileRequest): Promise<AccountProfileResponse> {
    return putJson<AccountProfileResponse, UpdateAccountProfileRequest>("/api/account/profile", request);
}

export function getAccountChats(limit = 50): Promise<AccountChatSummaryResponse[]> {
    return getJson<AccountChatSummaryResponse[]>(`/api/account/chats?limit=${limit}`);
}

export function getFavorites(): Promise<AccountFavoriteResponse[]> {
    return getJson<AccountFavoriteResponse[]>("/api/account/favorites");
}

export function upsertFavorite(request: UpsertFavoriteRequest): Promise<AccountFavoriteResponse> {
    return postJson<AccountFavoriteResponse, UpsertFavoriteRequest>("/api/account/favorites", request);
}

export function deleteFavorite(itemType: string, itemId: string): Promise<void> {
    return deleteJson(`/api/account/favorites/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}`);
}

export function getDonations(): Promise<AccountDonationResponse[]> {
    return getJson<AccountDonationResponse[]>("/api/account/donations");
}

export function createDonation(request: CreateDonationRequest): Promise<AccountDonationResponse> {
    return postJson<AccountDonationResponse, CreateDonationRequest>("/api/account/donations", request);
}

export function updateDonationStatus(donationId: string, request: UpdateDonationStatusRequest): Promise<AccountDonationResponse> {
    return postJson<AccountDonationResponse, UpdateDonationStatusRequest>(`/api/account/donations/${donationId}/status`, request);
}
