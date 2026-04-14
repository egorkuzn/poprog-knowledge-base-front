import {downloadFile, getJson} from "./http";
import type {
    AdminDonationEventPageResponse,
    AdminDonationKpiResponse
} from "./types";

export interface AdminDonationFilters {
    from?: string
    to?: string
    status?: string
    page?: number
    size?: number
}

function buildQuery(filters: AdminDonationFilters): string {
    const params = new URLSearchParams();

    if (filters.from) {
        params.set("from", filters.from);
    }
    if (filters.to) {
        params.set("to", filters.to);
    }
    if (filters.status && filters.status !== "ALL") {
        params.set("status", filters.status);
    }
    if (typeof filters.page === "number") {
        params.set("page", String(filters.page));
    }
    if (typeof filters.size === "number") {
        params.set("size", String(filters.size));
    }

    const query = params.toString();
    return query.length > 0 ? `?${query}` : "";
}

export function getAdminDonationKpi(filters: AdminDonationFilters): Promise<AdminDonationKpiResponse> {
    return getJson<AdminDonationKpiResponse>(`/api/admin/donations/kpi${buildQuery(filters)}`);
}

export function getAdminDonationEvents(filters: AdminDonationFilters): Promise<AdminDonationEventPageResponse> {
    return getJson<AdminDonationEventPageResponse>(`/api/admin/donations/events${buildQuery(filters)}`);
}

export function downloadAdminDonationEventsCsv(filters: AdminDonationFilters): Promise<void> {
    return downloadFile(`/api/admin/donations/export.csv${buildQuery(filters)}`, "donations-events.csv");
}

export function downloadAdminDonationEventsPdf(filters: AdminDonationFilters): Promise<void> {
    return downloadFile(`/api/admin/donations/export.pdf${buildQuery(filters)}`, "donations-events.pdf");
}
