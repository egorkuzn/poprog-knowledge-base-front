import {postJson} from "./http";

export interface PublicDonationRequest {
    amount: number
    currency: string
    source?: string
    message?: string
    returnUrl: string
    userName?: string
    userEmail?: string
}

export interface PublicDonationResponse {
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

export function submitPublicDonation(request: PublicDonationRequest): Promise<PublicDonationResponse> {
    return postJson<PublicDonationResponse, PublicDonationRequest>("/api/donations", request);
}
