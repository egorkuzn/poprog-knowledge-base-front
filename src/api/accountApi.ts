import {getJson, putJson} from "./http";
import type {AccountProfileResponse, UpdateAccountProfileRequest} from "./types";

export function getAccountProfile(): Promise<AccountProfileResponse> {
    return getJson<AccountProfileResponse>("/api/account/profile");
}

export function updateAccountProfile(request: UpdateAccountProfileRequest): Promise<AccountProfileResponse> {
    return putJson<AccountProfileResponse, UpdateAccountProfileRequest>("/api/account/profile", request);
}
