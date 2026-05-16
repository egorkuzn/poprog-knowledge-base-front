export type SiteFeedbackChoice = "yes" | "no";

export interface SiteFeedbackRequest {
    choice: SiteFeedbackChoice
    sentAt: string
}

export interface SiteFeedbackResponse {
    status: "accepted"
}

export async function submitSiteFeedback(request: SiteFeedbackRequest): Promise<SiteFeedbackResponse> {
    // TODO: replace with real backend integration when endpoint is available.
    await new Promise((resolve) => {
        window.setTimeout(resolve, 350);
    });

    console.info("site-feedback:stub-submit", request);
    return {status: "accepted"};
}


export interface DetailedSiteFeedbackRequest {
    sentAt: string
    answers: Record<string, Record<string, {rating: number, comment: string}>>
    summary: {
        overallRating: number
        whatLiked: string
        whatImproveFirst: string
    }
}

export interface DetailedSiteFeedbackResponse {
    status: "accepted"
}

export async function submitDetailedSiteFeedback(request: DetailedSiteFeedbackRequest): Promise<DetailedSiteFeedbackResponse> {
    // TODO: replace with real backend integration when endpoint is available.
    await new Promise((resolve) => {
        window.setTimeout(resolve, 450);
    });

    console.info("site-feedback:detailed-stub-submit", request);
    return {status: "accepted"};
}
