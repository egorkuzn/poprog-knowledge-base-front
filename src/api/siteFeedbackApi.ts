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
