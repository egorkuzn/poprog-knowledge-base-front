function resolvePortalUrl(envValue: string | undefined, fallbackUrl: string): string {
    const candidate = envValue?.trim();
    return candidate && candidate.length > 0 ? candidate : fallbackUrl;
}

export const rideConsoleUrl = resolvePortalUrl(import.meta.env.VITE_RIDE_CONSOLE_URL, "https://ride.poprog.org");
export const rideSignupUrl = resolvePortalUrl(import.meta.env.VITE_RIDE_SIGNUP_URL, `${rideConsoleUrl.replace(/\/+$/, "")}/signup`);
